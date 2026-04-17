-- Migration: Extend bets table for sports + casino betting
-- Idempotent: uses ADD COLUMN IF NOT EXISTS

ALTER TABLE public.bets
  ADD COLUMN IF NOT EXISTS event_id           uuid REFERENCES public.sport_events(id),
  ADD COLUMN IF NOT EXISTS round_id           uuid REFERENCES public.casino_rounds(id),
  ADD COLUMN IF NOT EXISTS bet_type           varchar(10) NOT NULL DEFAULT 'casino'
                                              CHECK (bet_type IN ('back','lay','casino')),
  ADD COLUMN IF NOT EXISTS outcome            varchar(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cashout_multiplier numeric(8,2),
  ADD COLUMN IF NOT EXISTS market_id          uuid REFERENCES public.odds_markets(id),
  ADD COLUMN IF NOT EXISTS result             varchar(10) DEFAULT 'pending'
                                              CHECK (result IN ('pending','win','lose','void','draw')),
  ADD COLUMN IF NOT EXISTS payout             numeric(12,2) DEFAULT 0;

-- Also add metadata column if missing (used by existing code)
ALTER TABLE public.bets
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bets_event_id ON public.bets(event_id);
CREATE INDEX IF NOT EXISTS idx_bets_round_id ON public.bets(round_id);
CREATE INDEX IF NOT EXISTS idx_bets_result ON public.bets(result);
CREATE INDEX IF NOT EXISTS idx_bets_user_result ON public.bets(user_id, result);
