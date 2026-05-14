create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text unique,
  full_name text,
  email text not null unique,
  phone text,
  profile_pic_url text,
  password_hash text,
  role text not null default 'user' check (role in ('admin', 'staff', 'user')),
  permissions jsonb not null default '{}'::jsonb,
  is_verified boolean not null default false,
  two_factor_enabled boolean not null default false,
  google_linked boolean not null default false,
  otp text,
  otp_expiry timestamptz,
  login_otp text,
  login_otp_expiry timestamptz,
  reset_otp text,
  reset_otp_expiry timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_users
add column if not exists permissions jsonb not null default '{}'::jsonb;

alter table public.app_users
add column if not exists username text unique,
add column if not exists full_name text,
add column if not exists phone text,
add column if not exists profile_pic_url text,
add column if not exists two_factor_enabled boolean not null default false,
add column if not exists google_linked boolean not null default false,
add column if not exists login_otp text,
add column if not exists login_otp_expiry timestamptz,
add column if not exists reset_otp text,
add column if not exists reset_otp_expiry timestamptz;

alter table public.app_users
alter column password_hash drop not null;

update public.app_users
set permissions = '{
  "dashboard.show": true,
  "dashboard.create": true,
  "dashboard.edit": true,
  "staff.show": true,
  "staff.create": true,
  "staff.edit": true,
  "users.show": true,
  "users.create": true,
  "users.edit": true
}'::jsonb
where role = 'admin';

create index if not exists app_users_email_idx on public.app_users (email);
create index if not exists app_users_username_idx on public.app_users (username);
create index if not exists app_users_role_idx on public.app_users (role);
create index if not exists app_users_created_at_idx on public.app_users (created_at desc);

alter table public.app_users enable row level security;

-- This app reads/writes through the Express backend with SUPABASE_SERVICE_ROLE_KEY.
-- No browser/client policies are needed unless you later connect Supabase directly from React.
