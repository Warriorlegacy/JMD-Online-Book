create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone varchar(20) unique,
  email varchar(200),
  full_name varchar(100),
  role varchar(20) default 'user' check (role in ('user', 'agent', 'admin')),
  balance numeric(12,2) default 0,
  bonus_balance numeric(12,2) default 0,
  total_deposited numeric(12,2) default 0,
  total_withdrawn numeric(12,2) default 0,
  total_won numeric(12,2) default 0,
  total_lost numeric(12,2) default 0,
  referral_code varchar(20) unique default upper(substr(md5(random()::text), 1, 8)),
  referred_by uuid references public.profiles(id),
  agent_id uuid references public.profiles(id),
  is_active boolean default true,
  is_verified boolean default false,
  avatar_url text,
  bank_account varchar(50),
  ifsc_code varchar(20),
  account_holder varchar(100),
  upi_id varchar(100),
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  type varchar(20) not null check (type in ('deposit','withdraw','bet','win','bonus','referral','commission','adjustment')),
  amount numeric(12,2) not null,
  balance_before numeric(12,2),
  balance_after numeric(12,2),
  status varchar(20) default 'pending' check (status in ('pending','approved','rejected','completed','processing')),
  payment_method varchar(50),
  payment_reference varchar(100),
  screenshot_url text,
  upi_id varchar(100),
  bank_account varchar(50),
  ifsc_code varchar(20),
  account_holder varchar(100),
  admin_note text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.games (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  provider varchar(100) not null,
  category varchar(50) not null check (category in ('sports','casino','lottery','cards','other')),
  thumbnail_url text,
  launch_url text,
  description text,
  is_active boolean default true,
  is_featured boolean default false,
  is_hot boolean default false,
  is_new boolean default false,
  sort_order int default 0,
  min_bet numeric(10,2) default 10,
  max_bet numeric(10,2) default 100000,
  tags text[] default '{}',
  play_count int default 0,
  created_at timestamptz default now()
);

create table if not exists public.bets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  game_id uuid not null references public.games(id),
  amount numeric(12,2) not null,
  odds numeric(8,4),
  potential_win numeric(12,2),
  result varchar(20) default 'pending' check (result in ('pending','win','lose','draw','void')),
  payout numeric(12,2),
  settled_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.commissions (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.profiles(id),
  player_id uuid not null references public.profiles(id),
  transaction_id uuid references public.transactions(id),
  amount numeric(12,2) not null,
  rate numeric(5,4) default 0.05,
  type varchar(20) default 'deposit',
  is_paid boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  title varchar(200) not null,
  body text not null,
  type varchar(50) default 'info' check (type in ('info','success','warning','danger','deposit','withdraw','win','system')),
  is_read boolean default false,
  action_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.otp_tokens (
  id uuid primary key default uuid_generate_v4(),
  identifier varchar(100) not null,
  token varchar(6) not null,
  purpose varchar(20) default 'login' check (purpose in ('login','register','reset','verify')),
  expires_at timestamptz not null,
  is_used boolean default false,
  attempt_count int default 0,
  created_at timestamptz default now()
);

create table if not exists public.payment_methods (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  type varchar(50) not null check (type in ('upi','bank','wallet','crypto')),
  details jsonb default '{}'::jsonb,
  is_active boolean default true,
  for_deposit boolean default true,
  for_withdraw boolean default true,
  sort_order int default 0,
  min_amount numeric(10,2) default 100,
  max_amount numeric(10,2) default 100000,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  key varchar(100) primary key,
  value text,
  type varchar(20) default 'string' check (type in ('string','number','boolean','json')),
  description text,
  updated_at timestamptz default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_bets_user_id on public.bets(user_id);
create index if not exists idx_bets_game_id on public.bets(game_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id, is_read);
create index if not exists idx_otp_identifier on public.otp_tokens(identifier, expires_at);
create index if not exists idx_profiles_referral_code on public.profiles(referral_code);
create index if not exists idx_profiles_referred_by on public.profiles(referred_by);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.bets enable row level security;
alter table public.notifications enable row level security;
alter table public.commissions enable row level security;
alter table public.games enable row level security;
alter table public.payment_methods enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists own_profile_select on public.profiles;
drop policy if exists own_profile_update on public.profiles;
drop policy if exists profile_insert on public.profiles;
drop policy if exists admin_all_profiles on public.profiles;
create policy own_profile_select on public.profiles for select using (auth.uid() = id);
create policy own_profile_update on public.profiles for update using (auth.uid() = id);
create policy profile_insert on public.profiles for insert with check (auth.uid() = id);
create policy admin_all_profiles on public.profiles for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','agent'))
);

drop policy if exists own_transactions_select on public.transactions;
drop policy if exists own_transactions_insert on public.transactions;
drop policy if exists admin_all_transactions on public.transactions;
create policy own_transactions_select on public.transactions for select using (auth.uid() = user_id);
create policy own_transactions_insert on public.transactions for insert with check (auth.uid() = user_id);
create policy admin_all_transactions on public.transactions for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','agent'))
);

drop policy if exists own_bets_select on public.bets;
drop policy if exists own_bets_insert on public.bets;
drop policy if exists admin_bets on public.bets;
create policy own_bets_select on public.bets for select using (auth.uid() = user_id);
create policy own_bets_insert on public.bets for insert with check (auth.uid() = user_id);
create policy admin_bets on public.bets for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists own_notifications on public.notifications;
create policy own_notifications on public.notifications for all using (auth.uid() = user_id);

drop policy if exists own_commissions on public.commissions;
drop policy if exists admin_commissions on public.commissions;
create policy own_commissions on public.commissions for select using (auth.uid() = agent_id);
create policy admin_commissions on public.commissions for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists public_games_read on public.games;
drop policy if exists admin_games_all on public.games;
create policy public_games_read on public.games for select using (is_active = true);
create policy admin_games_all on public.games for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists public_payment_methods on public.payment_methods;
drop policy if exists admin_payment_methods on public.payment_methods;
create policy public_payment_methods on public.payment_methods for select using (is_active = true);
create policy admin_payment_methods on public.payment_methods for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists public_settings_read on public.site_settings;
drop policy if exists admin_settings_all on public.site_settings;
create policy public_settings_read on public.site_settings for select using (true);
create policy admin_settings_all on public.site_settings for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.profiles;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.update_balance(p_user_id uuid, p_amount numeric, p_type text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_current numeric;
  v_new numeric;
begin
  select balance into v_current from public.profiles where id = p_user_id for update;
  if v_current is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  if p_type in ('withdraw','bet') and (v_current + p_amount) < 0 then
    return jsonb_build_object('success', false, 'error', 'Insufficient balance');
  end if;
  v_new := v_current + p_amount;
  update public.profiles
  set
    balance = v_new,
    total_deposited = case when p_type = 'deposit' then total_deposited + abs(p_amount) else total_deposited end,
    total_withdrawn = case when p_type = 'withdraw' then total_withdrawn + abs(p_amount) else total_withdrawn end,
    updated_at = now()
  where id = p_user_id;
  return jsonb_build_object('success', true, 'previous', v_current, 'balance', v_new);
end;
$$;

create or replace function public.get_dashboard_stats()
returns jsonb
language plpgsql
security definer
as $$
declare v jsonb;
begin
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles where role = 'user'),
    'total_agents', (select count(*) from public.profiles where role = 'agent'),
    'today_deposits', coalesce((select sum(amount) from public.transactions where type = 'deposit' and status = 'approved' and created_at::date = current_date), 0),
    'today_withdrawals', coalesce((select sum(amount) from public.transactions where type = 'withdraw' and status = 'approved' and created_at::date = current_date), 0),
    'pending_deposits', (select count(*) from public.transactions where type = 'deposit' and status = 'pending'),
    'pending_withdrawals', (select count(*) from public.transactions where type = 'withdraw' and status = 'pending'),
    'total_balance', coalesce((select sum(balance) from public.profiles where role = 'user'), 0),
    'new_users_today', (select count(*) from public.profiles where created_at::date = current_date)
  ) into v;
  return v;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('screenshots', 'screenshots', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

insert into public.site_settings (key, value, type, description) values
  ('site_name', 'JMD Online Book', 'string', 'Platform name'),
  ('min_deposit', '100', 'number', 'Minimum deposit'),
  ('min_withdraw', '200', 'number', 'Minimum withdraw'),
  ('max_withdraw_daily', '50000', 'number', 'Daily withdraw cap'),
  ('referral_commission_rate', '0.05', 'number', 'Direct commission'),
  ('second_level_commission_rate', '0.02', 'number', 'Second level commission'),
  ('maintenance_mode', 'false', 'boolean', 'Maintenance flag'),
  ('announcement', 'Fast deposits. Manual approvals. Live balance updates.', 'string', 'Ticker')
on conflict (key) do nothing;
