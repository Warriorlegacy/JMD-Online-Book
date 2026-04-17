-- Gamification System Migration: Daily Rewards, Streaks, Cashback, Notifications

-- 1. Daily Login Streaks & Rewards Table
create table if not exists public.user_streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak int default 0 not null,
  max_streak int default 0 not null,
  last_login_date date not null default current_date,
  total_logins int default 0 not null,
  last_claimed_daily date,
  last_claimed_streak_tier int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Daily Rewards Configuration
create table if not exists public.daily_rewards (
  day_number int primary key,
  reward_amount numeric(12,2) default 0 not null,
  reward_type varchar(20) default 'bonus' check (reward_type in ('cash','bonus','free_bet')),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Streak Tier Rewards
create table if not exists public.streak_tiers (
  streak_days int primary key,
  reward_amount numeric(12,2) default 0 not null,
  reward_multiplier numeric(4,2) default 1.0 not null,
  badge_name varchar(50),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. Loss Recovery Cashback
create table if not exists public.loss_recovery (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  loss_amount numeric(12,2) not null,
  cashback_percent numeric(5,4) default 0.05 not null,
  cashback_amount numeric(12,2) not null,
  is_claimed boolean default false,
  claimed_at timestamptz,
  valid_until timestamptz not null,
  created_at timestamptz default now()
);

-- 5. Near Win Events
create table if not exists public.near_win_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  bet_id uuid references public.bets(id) on delete cascade not null,
  game_id uuid references public.games(id) not null,
  bet_amount numeric(12,2) not null,
  proximity_score numeric(3,2) not null, -- 0.0 = no, 0.9 = almost won
  notification_sent boolean default false,
  created_at timestamptz default now()
);

-- 6. Friend Relationships
create table if not exists public.user_friends (
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  is_following boolean default true,
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);

-- Indexes
create index if not exists idx_user_streaks_last_login on public.user_streaks(last_login_date);
create index if not exists idx_loss_recovery_user on public.loss_recovery(user_id, is_claimed);
create index if not exists idx_near_win_events_user on public.near_win_events(user_id);
create index if not exists idx_user_friends_user on public.user_friends(user_id);

-- Enable RLS
alter table public.user_streaks enable row level security;
alter table public.daily_rewards enable row level security;
alter table public.streak_tiers enable row level security;
alter table public.loss_recovery enable row level security;
alter table public.near_win_events enable row level security;
alter table public.user_friends enable row level security;

-- Policies
create policy own_streak_select on public.user_streaks for select using (auth.uid() = user_id);
create policy own_streak_update on public.user_streaks for update using (auth.uid() = user_id);

create policy public_daily_rewards on public.daily_rewards for select using (true);
create policy public_streak_tiers on public.streak_tiers for select using (true);

create policy own_loss_recovery on public.loss_recovery for select using (auth.uid() = user_id);
create policy own_near_win on public.near_win_events for select using (auth.uid() = user_id);
create policy own_friends on public.user_friends for all using (auth.uid() = user_id);

-- Seed default daily rewards
insert into public.daily_rewards (day_number, reward_amount, reward_type) values
(1, 10.00, 'bonus'),
(2, 15.00, 'bonus'),
(3, 25.00, 'bonus'),
(4, 35.00, 'bonus'),
(5, 50.00, 'bonus'),
(6, 75.00, 'bonus'),
(7, 100.00, 'cash')
on conflict (day_number) do nothing;

-- Seed default streak tiers
insert into public.streak_tiers (streak_days, reward_amount, reward_multiplier, badge_name) values
(7, 150.00, 1.0, 'Week Warrior'),
(14, 350.00, 1.2, 'Fortune Fighter'),
(30, 1000.00, 1.5, 'Monthly Master'),
(60, 2500.00, 2.0, 'Diamond Player'),
(90, 5000.00, 2.5, 'Legend Status')
on conflict (streak_days) do nothing;

--
-- Database Functions
--

-- Update user login streak
create or replace function public.update_login_streak(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_today date := current_date;
  v_yesterday date := current_date - 1;
  v_last_date date;
  v_current_streak int;
  v_new_streak int;
  v_max_streak int;
begin
  insert into public.user_streaks (user_id, current_streak, max_streak, last_login_date, total_logins)
  values (p_user_id, 1, 1, v_today, 1)
  on conflict (user_id) do update set
    last_login_date = excluded.last_login_date,
    total_logins = user_streaks.total_logins + 1,
    current_streak = case
      when user_streaks.last_login_date = v_today then user_streaks.current_streak
      when user_streaks.last_login_date = v_yesterday then user_streaks.current_streak + 1
      else 1
    end,
    max_streak = greatest(user_streaks.max_streak, case
      when user_streaks.last_login_date = v_today then user_streaks.current_streak
      when user_streaks.last_login_date = v_yesterday then user_streaks.current_streak + 1
      else 1
    end),
    updated_at = now()
  returning current_streak, max_streak, last_login_date into v_current_streak, v_max_streak, v_last_date;

  return jsonb_build_object(
    'success', true,
    'current_streak', v_current_streak,
    'max_streak', v_max_streak,
    'last_login', v_last_date
  );
end;
$$;

-- Claim daily reward atomically
create or replace function public.claim_daily_reward(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_streak public.user_streaks;
  v_reward public.daily_rewards;
  v_balance_result jsonb;
  v_day_num int;
begin
  select * into v_streak from public.user_streaks where user_id = p_user_id for update;

  if v_streak is null then
    return jsonb_build_object('success', false, 'error', 'Streak record not found');
  end if;

  if v_streak.last_claimed_daily = current_date then
    return jsonb_build_object('success', false, 'error', 'Reward already claimed today');
  end if;

  v_day_num := ((v_streak.current_streak - 1) % 7) + 1;

  select * into v_reward from public.daily_rewards
  where day_number = v_day_num and is_active = true;

  if v_reward is null then
    return jsonb_build_object('success', false, 'error', 'No reward configured for this day');
  end if;

  -- Apply balance update (atomic)
  select * into v_balance_result from public.update_balance(p_user_id, v_reward.reward_amount, 'bonus');

  if (v_balance_result->>'success')::boolean = false then
    return v_balance_result;
  end if;

  -- Update claim status
  update public.user_streaks
  set last_claimed_daily = current_date, updated_at = now()
  where user_id = p_user_id;

  -- Record transaction
  insert into public.transactions (user_id, type, amount, balance_before, balance_after, status)
  values (
    p_user_id,
    'bonus',
    v_reward.reward_amount,
    (v_balance_result->>'previous')::numeric,
    (v_balance_result->>'balance')::numeric,
    'completed'
  );

  return jsonb_build_object(
    'success', true,
    'amount', v_reward.reward_amount,
    'day', v_day_num,
    'streak', v_streak.current_streak,
    'new_balance', v_balance_result->>'balance'
  );
end;
$$;

-- Record loss and issue cashback automatically
create or replace function public.process_loss_cashback(p_user_id uuid, p_loss_amount numeric)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_cashback_pct numeric := 0.05;
  v_cashback_amount numeric;
  v_total_loss_24h numeric;
begin
  select coalesce(sum(amount), 0) into v_total_loss_24h
  from public.bets
  where user_id = p_user_id
    and result = 'lose'
    and created_at >= now() - interval '24 hours';

  v_total_loss_24h := v_total_loss_24h + abs(p_loss_amount);

  -- Only issue cashback when total 24h loss >= 500
  if v_total_loss_24h >= 500 then
    -- Progressive cashback: 5% up to 20% max
    v_cashback_pct := least(0.05 + (v_total_loss_24h / 10000), 0.20);
    v_cashback_amount := round(v_total_loss_24h * v_cashback_pct, 2);

    insert into public.loss_recovery (user_id, loss_amount, cashback_percent, cashback_amount, valid_until)
    values (p_user_id, v_total_loss_24h, v_cashback_pct, v_cashback_amount, now() + interval '7 days')
    on conflict do nothing;

    return jsonb_build_object(
      'success', true,
      'cashback_issued', true,
      'amount', v_cashback_amount,
      'percent', v_cashback_pct,
      'valid_until', now() + interval '7 days'
    );
  end if;

  return jsonb_build_object('success', true, 'cashback_issued', false);
end;
$$;

-- Record near win event
create or replace function public.record_near_win(p_bet_id uuid, p_proximity numeric)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_bet public.bets;
begin
  select * into v_bet from public.bets where id = p_bet_id;

  if v_bet is null then
    return jsonb_build_object('success', false, 'error', 'Bet not found');
  end if;

  insert into public.near_win_events (user_id, bet_id, game_id, bet_amount, proximity_score)
  values (v_bet.user_id, p_bet_id, v_bet.game_id, v_bet.amount, p_proximity);

  return jsonb_build_object('success', true);
end;
$$;

-- Claim streak tier reward
create or replace function public.claim_streak_reward(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_streak public.user_streaks;
  v_tier public.streak_tiers;
  v_balance_result jsonb;
begin
  select * into v_streak from public.user_streaks where user_id = p_user_id for update;

  select * into v_tier from public.streak_tiers
  where streak_days <= v_streak.current_streak
    and streak_days > v_streak.last_claimed_streak_tier
    and is_active = true
  order by streak_days desc limit 1;

  if v_tier is null then
    return jsonb_build_object('success', false, 'error', 'No new streak rewards available');
  end if;

  select * into v_balance_result from public.update_balance(p_user_id, v_tier.reward_amount, 'bonus');

  if (v_balance_result->>'success')::boolean = false then
    return v_balance_result;
  end if;

  update public.user_streaks
  set last_claimed_streak_tier = v_tier.streak_days, updated_at = now()
  where user_id = p_user_id;

  insert into public.transactions (user_id, type, amount, balance_before, balance_after, status)
  values (
    p_user_id,
    'bonus',
    v_tier.reward_amount,
    (v_balance_result->>'previous')::numeric,
    (v_balance_result->>'balance')::numeric,
    'completed'
  );

  return jsonb_build_object(
    'success', true,
    'tier', v_tier.streak_days,
    'amount', v_tier.reward_amount,
    'badge', v_tier.badge_name,
    'new_balance', v_balance_result->>'balance'
  );
end;
$$;

-- Add to realtime publication
alter publication supabase_realtime add table public.user_streaks;
alter publication supabase_realtime add table public.loss_recovery;
-- notifications already added in a previous migration
