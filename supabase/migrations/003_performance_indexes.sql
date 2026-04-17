-- Performance indexes for 10K user scaling
-- Run this in Supabase SQL Editor

-- Transactions indexes (CRITICAL for wallet queries)
create index if not exists idx_user_id on public.transactions(user_id);
create index if not exists idx_status on public.transactions(status);

create index if not exists idx_transactions_user_id_created
on public.transactions(user_id, created_at desc);

create index if not exists idx_transactions_tenant_user
on public.transactions(tenant_id, user_id) where tenant_id is not null;

-- Notifications indexes
create index if not exists idx_notifications_user_read 
on public.notifications(user_id, is_read, created_at desc);

create index if not exists idx_notifications_tenant_user 
on public.notifications(tenant_id, user_id) where tenant_id is not null;

-- Profiles indexes
create index if not exists idx_profiles_tenant_email 
on public.profiles(tenant_id, email) where tenant_id is not null;

create index if not exists idx_profiles_tenant_active 
on public.profiles(tenant_id, is_active) where tenant_id is not null;

-- Commissions indexes
create index if not exists idx_commissions_agent_created 
on public.commissions(agent_id, created_at desc);

create index if not exists idx_commissions_tenant_agent 
on public.commissions(tenant_id, agent_id) where tenant_id is not null;

-- Platform revenue indexes
create index if not exists idx_platform_revenue_tenant_type 
on public.platform_revenue(tenant_id, type, created_at desc);

-- Games and payment methods (tenant-scoped)
create index if not exists idx_games_tenant_active 
on public.games(tenant_id, is_active) where tenant_id is not null;

create index if not exists idx_payment_methods_tenant 
on public.payment_methods(tenant_id, is_active) where tenant_id is not null;

-- Site settings (tenant-scoped)
create index if not exists idx_site_settings_tenant_key 
on public.site_settings(tenant_id, key) where tenant_id is not null;

-- Analyze tables for query planner
analyze public.transactions;
analyze public.notifications;
analyze public.profiles;
analyze public.commissions;
analyze public.platform_revenue;