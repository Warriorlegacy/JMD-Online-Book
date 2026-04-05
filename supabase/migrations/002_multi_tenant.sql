-- Multi-tenant system migration
-- Adds tenant support to JMD Online Book SaaS platform

-- Create tenants table (super admin manages this)
create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  slug varchar(50) not null unique,
  domain varchar(255),
  logo_url text,
  primary_color varchar(20) default '#f59e0b',
  secondary_color varchar(20) default '#1e293b',
  theme_config jsonb default '{}'::jsonb,
  owner_id uuid references public.profiles(id),
  subscription_plan varchar(20) default 'free' check (subscription_plan in ('free','basic','pro','enterprise')),
  monthly_price numeric(10,2) default 0,
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  is_active boolean default true,
  is_suspended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add tenant_id to existing tables
alter table public.profiles add column if not exists tenant_id uuid references public.tenants(id);
alter table public.transactions add column if not exists tenant_id uuid references public.tenants(id);
alter table public.notifications add column if not exists tenant_id uuid references public.tenants(id);
alter table public.commissions add column if not exists tenant_id uuid references public.tenants(id);
alter table public.games add column if not exists tenant_id uuid references public.tenants(id);
alter table public.payment_methods add column if not exists tenant_id uuid references public.tenants(id);
alter table public.site_settings add column if not exists tenant_id uuid references public.tenants(id);

-- Create platform revenue tracking table
create table if not exists public.platform_revenue (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id),
  type varchar(20) not null check (type in ('subscription','commission','one_time')),
  amount numeric(12,2) not null,
  currency varchar(10) default 'INR',
  transaction_id uuid references public.transactions(id),
  description text,
  created_at timestamptz default now()
);

-- Update profiles role to include super_admin
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check 
  check (role in ('super_admin','admin','agent','user'));

-- Indexes for tenants
create unique index if not exists idx_tenants_slug on public.tenants(slug);
create unique index if not exists idx_tenants_domain on public.tenants(domain) where domain is not null;
create index if not exists idx_tenants_owner on public.tenants(owner_id);
create index if not exists idx_tenants_status on public.tenants(is_active, is_suspended);
create index if not exists idx_profiles_tenant on public.profiles(tenant_id);
create index if not exists idx_transactions_tenant on public.transactions(tenant_id);
create index if not exists idx_notifications_tenant on public.notifications(tenant_id);
create index if not exists idx_commissions_tenant on public.commissions(tenant_id);
create index if not exists idx_platform_revenue_tenant on public.platform_revenue(tenant_id, created_at);

-- RLS for tenants (only super_admin can manage)
alter table public.tenants enable row level security;
alter table public.platform_revenue enable row level security;

drop policy if exists super_admin_tenants on public.tenants;
create policy super_admin_tenants on public.tenants for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin')
);

drop policy if exists tenant_revenue_read on public.platform_revenue;
create policy tenant_revenue_read on public.platform_revenue for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin','admin'))
);

-- Function to get current tenant context
create or replace function public.get_current_tenant_id()
returns uuid
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_host text;
  v_subdomain text;
begin
  -- Try to get from request header first (set by middleware)
  v_tenant_id := nullif(current_setting('request.jwt.claim tenant_id', true), '')::uuid;
  if v_tenant_id is not null then
    return v_tenant_id;
  end if;

  -- Fallback: extract from host header (subdomain based)
  v_host := current_setting('request.headers.host', true);
  if v_host is not null and position('.' in v_host) > 0 then
    v_subdomain := split_part(v_host, '.', 1);
    select id into v_tenant_id from public.tenants 
    where slug = v_subdomain and is_active = true and is_suspended = false;
    return v_tenant_id;
  end if;

  return null;
end;
$$;

-- Function for super admin stats
create or replace function public.get_platform_stats()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_stats jsonb;
begin
  select jsonb_build_object(
    'total_tenants', (select count(*) from public.tenants where is_active = true),
    'active_tenants', (select count(*) from public.tenants where is_active = true and is_suspended = false),
    'suspended_tenants', (select count(*) from public.tenants where is_suspended = true),
    'total_users', (select count(*) from public.profiles where role = 'user'),
    'total_admins', (select count(*) from public.profiles where role in ('admin','super_admin')),
    'total_revenue', coalesce((select sum(amount) from public.platform_revenue), 0),
    'monthly_revenue', coalesce((select sum(amount) from public.platform_revenue 
      where created_at >= date_trunc('month', now())), 0),
    'pending_approvals', (select count(*) from public.transactions where status = 'pending')
  ) into v_stats;
  return v_stats;
end;
$$;

-- Function to create tenant and default admin
create or replace function public.create_tenant_with_admin(
  p_tenant_name text,
  p_slug text,
  p_domain text,
  p_owner_email text,
  p_owner_name text,
  p_primary_color text default '#f59e0b'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_user_id uuid;
  v_tenant_data record;
begin
  -- Create tenant
  insert into public.tenants (name, slug, domain, primary_color, subscription_plan)
  values (p_tenant_name, p_slug, p_domain, p_primary_color, 'basic')
  returning id into v_tenant_id;

  -- Create admin user (in auth.users)
  insert into auth.users (email, email_confirmed_at, raw_user_meta_data)
  values (p_owner_email, now(), jsonb_build_object('full_name', p_owner_name, 'tenant_id', v_tenant_id))
  returning id into v_user_id;

  -- Create profile with tenant_id and admin role
  insert into public.profiles (id, full_name, email, role, tenant_id)
  values (v_user_id, p_owner_name, p_owner_email, 'admin', v_tenant_id);

  -- Create default site settings for tenant
  insert into public.site_settings (key, value, type, tenant_id, description)
  values 
    ('site_name', p_tenant_name, 'string', v_tenant_id, 'App name'),
    ('min_deposit', '100', 'number', v_tenant_id, 'Min deposit'),
    ('min_withdraw', '200', 'number', v_tenant_id, 'Min withdraw'),
    ('announcement', 'Welcome to ' || p_tenant_name, 'string', v_tenant_id, 'Announcement');

  return v_tenant_id;
end;
$$;

-- Update handle_new_user to handle tenant assignment
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
begin
  -- Get tenant_id from metadata if provided
  v_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;
  
  -- If no tenant, assign to default (first active tenant or create one)
  if v_tenant_id is null then
    select id into v_tenant_id from public.tenants where is_active = true and is_suspended = false limit 1;
    if v_tenant_id is null then
      -- Create default tenant if none exists
      insert into public.tenants (name, slug, primary_color, subscription_plan)
      values ('Default', 'default', '#f59e0b', 'free')
      returning id into v_tenant_id;
    end if;
  end if;

  insert into public.profiles (id, full_name, email, tenant_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    v_tenant_id
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create default super admin if not exists (run manually in SQL editor)
-- This creates a system super admin for managing all tenants