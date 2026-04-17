-- Migration: Settlement RPC functions
-- settle_sport_event and settle_casino_round — both idempotent

CREATE OR REPLACE FUNCTION public.settle_sport_event(
  p_event_id   uuid,
  p_result     varchar,
  p_admin_id   uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bet          RECORD;
  v_payout       numeric;
  v_total_bets   integer := 0;
  v_total_payout numeric := 0;
BEGIN
  -- Idempotency guard
  IF EXISTS (
    SELECT 1 FROM public.sport_events WHERE id = p_event_id AND status = 'settled'
  ) THEN
    RETURN jsonb_build_object('already_settled', true);
  END IF;

  -- Lock event row
  PERFORM id FROM public.sport_events WHERE id = p_event_id FOR UPDATE;

  -- Process each pending bet
  FOR v_bet IN
    SELECT b.id, b.user_id, b.stake, b.outcome, b.bet_type,
           om.back_odds, om.lay_odds,
           COALESCE(om.override_back_odds, om.back_odds) AS eff_back,
           COALESCE(om.override_lay_odds,  om.lay_odds)  AS eff_lay
    FROM public.bets b
    LEFT JOIN public.odds_markets om ON om.id = b.market_id
    WHERE b.event_id = p_event_id AND b.result = 'pending'
  LOOP
    v_total_bets := v_total_bets + 1;

    IF p_result = 'void' THEN
      v_payout := v_bet.stake;
      UPDATE public.bets SET result = 'void', payout = v_payout WHERE id = v_bet.id;
      INSERT INTO public.transactions (id, user_id, type, amount, status, admin_note, created_at, updated_at)
        VALUES (gen_random_uuid(), v_bet.user_id, 'win', v_payout, 'completed', 'Bet void refund', now(), now());
      UPDATE public.profiles SET balance = balance + v_payout WHERE id = v_bet.user_id;

    ELSIF p_result = 'draw' THEN
      v_payout := v_bet.stake;
      UPDATE public.bets SET result = 'draw', payout = v_payout WHERE id = v_bet.id;
      INSERT INTO public.transactions (id, user_id, type, amount, status, admin_note, created_at, updated_at)
        VALUES (gen_random_uuid(), v_bet.user_id, 'win', v_payout, 'completed', 'Bet draw refund', now(), now());
      UPDATE public.profiles SET balance = balance + v_payout WHERE id = v_bet.user_id;

    ELSIF v_bet.outcome = p_result THEN
      -- Win
      v_payout := CASE v_bet.bet_type
        WHEN 'back' THEN v_bet.stake * COALESCE(v_bet.eff_back, 1.95)
        WHEN 'lay'  THEN v_bet.stake * COALESCE(v_bet.eff_lay,  1.95)
        ELSE              v_bet.stake * 1.95
      END;
      UPDATE public.bets SET result = 'win', payout = v_payout WHERE id = v_bet.id;
      INSERT INTO public.transactions (id, user_id, type, amount, status, admin_note, created_at, updated_at)
        VALUES (gen_random_uuid(), v_bet.user_id, 'win', v_payout, 'completed', 'Sports bet win', now(), now());
      UPDATE public.profiles SET balance = balance + v_payout, total_won = total_won + v_payout WHERE id = v_bet.user_id;

    ELSE
      -- Lose
      v_payout := 0;
      UPDATE public.bets SET result = 'lose', payout = 0 WHERE id = v_bet.id;
      UPDATE public.profiles SET total_lost = total_lost + v_bet.stake WHERE id = v_bet.user_id;
    END IF;

    v_total_payout := v_total_payout + v_payout;
  END LOOP;

  -- Mark event settled
  UPDATE public.sport_events
    SET status = 'settled', result = p_result, updated_at = now()
  WHERE id = p_event_id;

  -- Write settlement log
  INSERT INTO public.settlement_log (event_id, settled_by, total_bets, total_payout)
  VALUES (p_event_id, p_admin_id, v_total_bets, v_total_payout);

  RETURN jsonb_build_object('total_bets', v_total_bets, 'total_payout', v_total_payout);
END;
$$;


CREATE OR REPLACE FUNCTION public.settle_casino_round(
  p_round_id  uuid,
  p_result    varchar,
  p_admin_id  uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bet          RECORD;
  v_game_slug    varchar;
  v_payout       numeric;
  v_multiplier   numeric;
  v_total_bets   integer := 0;
  v_total_payout numeric := 0;
BEGIN
  -- Idempotency guard
  IF EXISTS (
    SELECT 1 FROM public.casino_rounds WHERE id = p_round_id AND status = 'settled'
  ) THEN
    RETURN jsonb_build_object('already_settled', true);
  END IF;

  -- Lock round row
  PERFORM id FROM public.casino_rounds WHERE id = p_round_id FOR UPDATE;

  -- Get game slug
  SELECT g.category INTO v_game_slug
  FROM public.casino_rounds cr
  JOIN public.games g ON g.id = cr.game_id
  WHERE cr.id = p_round_id;

  -- Process each pending bet
  FOR v_bet IN
    SELECT id, user_id, stake, outcome
    FROM public.bets
    WHERE round_id = p_round_id AND result = 'pending'
  LOOP
    v_total_bets := v_total_bets + 1;

    -- Determine payout multiplier based on game and outcome
    IF v_bet.outcome = p_result THEN
      v_multiplier := CASE
        WHEN v_game_slug IN ('teen_patti','dragon_tiger') AND p_result = 'tie' THEN 8.0
        WHEN v_game_slug IN ('teen_patti','dragon_tiger') THEN 1.95
        WHEN v_game_slug = 'andar_bahar' THEN 1.90
        ELSE 1.95
      END;
      v_payout := v_bet.stake * v_multiplier;
      UPDATE public.bets SET result = 'win', payout = v_payout WHERE id = v_bet.id;
      INSERT INTO public.transactions (id, user_id, type, amount, status, admin_note, created_at, updated_at)
        VALUES (gen_random_uuid(), v_bet.user_id, 'win', v_payout, 'completed', 'Casino win', now(), now());
      UPDATE public.profiles SET balance = balance + v_payout, total_won = total_won + v_payout WHERE id = v_bet.user_id;
    ELSE
      v_payout := 0;
      UPDATE public.bets SET result = 'lose', payout = 0 WHERE id = v_bet.id;
      UPDATE public.profiles SET total_lost = total_lost + v_bet.stake WHERE id = v_bet.user_id;
    END IF;

    v_total_payout := v_total_payout + v_payout;
  END LOOP;

  -- Mark round settled
  UPDATE public.casino_rounds
    SET status = 'settled', result = p_result, settled_at = now()
  WHERE id = p_round_id;

  -- Write settlement log
  INSERT INTO public.settlement_log (round_id, settled_by, total_bets, total_payout)
  VALUES (p_round_id, p_admin_id, v_total_bets, v_total_payout);

  RETURN jsonb_build_object('total_bets', v_total_bets, 'total_payout', v_total_payout);
END;
$$;
