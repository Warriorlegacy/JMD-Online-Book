-- Migration: Betting Schema — sport_events, odds_markets, casino_rounds, settlement_log, odds_api_cache
-- Idempotent: safe to run multiple times

-- sport_events
CREATE TABLE IF NOT EXISTS public.sport_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid REFERENCES public.tenants(id),
  sport             varchar(50) NOT NULL,
  league            varchar(100),
  home_team         varchar(100) NOT NULL,
  away_team         varchar(100) NOT NULL,
  start_time        timestamptz NOT NULL,
  status            varchar(20) NOT NULL DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming','live','suspended','settled','cancelled')),
  is_betting_locked boolean NOT NULL DEFAULT false,
  result            varchar(100),
  external_event_id varchar(100),
  score             varchar(50),
  elapsed_time      varchar(20),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- odds_markets
CREATE TABLE IF NOT EXISTS public.odds_markets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid NOT NULL REFERENCES public.sport_events(id) ON DELETE CASCADE,
  market_name         varchar(100) NOT NULL,
  outcome             varchar(100) NOT NULL,
  back_odds           numeric(8,4) NOT NULL DEFAULT 1.01,
  lay_odds            numeric(8,4) NOT NULL DEFAULT 1.01,
  is_active           boolean NOT NULL DEFAULT true,
  override_back_odds  numeric(8,4),
  override_lay_odds   numeric(8,4),
  is_stale            boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- casino_rounds
CREATE TABLE IF NOT EXISTS public.casino_rounds (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES public.tenants(id),
  game_id     uuid NOT NULL REFERENCES public.games(id),
  status      varchar(20) NOT NULL DEFAULT 'waiting'
              CHECK (status IN ('waiting','betting_open','dealing','result','settled')),
  result      varchar(100),
  crash_point numeric(8,2),
  settled_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- settlement_log
CREATE TABLE IF NOT EXISTS public.settlement_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid REFERENCES public.sport_events(id),
  round_id     uuid REFERENCES public.casino_rounds(id),
  settled_by   uuid NOT NULL REFERENCES public.profiles(id),
  total_bets   integer NOT NULL DEFAULT 0,
  total_payout numeric(12,2) NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- odds_api_cache
CREATE TABLE IF NOT EXISTS public.odds_api_cache (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_key    varchar(50) NOT NULL,
  event_id     varchar(100) NOT NULL,
  raw_response jsonb NOT NULL,
  fetched_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sport_key, event_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sport_events_sport ON public.sport_events(sport);
CREATE INDEX IF NOT EXISTS idx_sport_events_status ON public.sport_events(status);
CREATE INDEX IF NOT EXISTS idx_sport_events_start_time ON public.sport_events(start_time);
CREATE INDEX IF NOT EXISTS idx_odds_markets_event_id ON public.odds_markets(event_id);
CREATE INDEX IF NOT EXISTS idx_casino_rounds_game_id ON public.casino_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_casino_rounds_status ON public.casino_rounds(status);
CREATE INDEX IF NOT EXISTS idx_settlement_log_event_id ON public.settlement_log(event_id);
CREATE INDEX IF NOT EXISTS idx_settlement_log_round_id ON public.settlement_log(round_id);

-- RLS
ALTER TABLE public.sport_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_sport_events" ON public.sport_events;
CREATE POLICY "read_sport_events" ON public.sport_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_write_sport_events" ON public.sport_events;
CREATE POLICY "admin_write_sport_events" ON public.sport_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

ALTER TABLE public.odds_markets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_odds_markets" ON public.odds_markets;
CREATE POLICY "read_odds_markets" ON public.odds_markets FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_write_odds_markets" ON public.odds_markets;
CREATE POLICY "admin_write_odds_markets" ON public.odds_markets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

ALTER TABLE public.casino_rounds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_casino_rounds" ON public.casino_rounds;
CREATE POLICY "read_casino_rounds" ON public.casino_rounds FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_write_casino_rounds" ON public.casino_rounds;
CREATE POLICY "admin_write_casino_rounds" ON public.casino_rounds FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

ALTER TABLE public.settlement_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_settlement_log" ON public.settlement_log;
CREATE POLICY "admin_settlement_log" ON public.settlement_log FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

ALTER TABLE public.odds_api_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_odds_cache" ON public.odds_api_cache;
CREATE POLICY "admin_odds_cache" ON public.odds_api_cache FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);
