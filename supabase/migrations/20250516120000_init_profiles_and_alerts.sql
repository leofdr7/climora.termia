-- Account type for users vs grocery stores
create type public.account_type as enum ('individual', 'grocery');

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type public.account_type not null default 'individual',
  full_name text not null default '',
  store_name text,
  business_address text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_onboarding_idx on public.profiles (onboarding_complete);

-- Alert subscriptions (location + thresholds)
create table public.alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  alert_email text not null,
  lat double precision not null,
  lon double precision not null,
  timezone text not null default 'UTC',
  min_temp_alert_celsius double precision not null default 2,
  max_temp_alert_celsius double precision not null default 32,
  daily_digest_hour smallint not null default 8 check (daily_digest_hour >= 0 and daily_digest_hour <= 23),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index alert_subscriptions_active_idx on public.alert_subscriptions (is_active) where is_active = true;

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger alert_subscriptions_updated_at
  before update on public.alert_subscriptions
  for each row execute function public.set_updated_at();

-- New user -> profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  atype text;
  parsed_type public.account_type;
begin
  atype := coalesce(new.raw_user_meta_data->>'account_type', 'individual');
  begin
    parsed_type := atype::public.account_type;
  exception
    when invalid_text_representation then
      parsed_type := 'individual';
  end;

  insert into public.profiles (id, account_type, full_name)
  values (
    new.id,
    parsed_type,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.alert_subscriptions enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users read own subscriptions"
  on public.alert_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own subscriptions"
  on public.alert_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users update own subscriptions"
  on public.alert_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users delete own subscriptions"
  on public.alert_subscriptions for delete
  using (auth.uid() = user_id);
