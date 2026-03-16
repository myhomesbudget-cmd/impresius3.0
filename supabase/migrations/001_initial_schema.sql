-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Plans table
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Nuovo Piano',
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  payment_id text,
  payment_provider text check (payment_provider in ('stripe', 'paypal')),
  data jsonb not null default '{}'::jsonb,
  results jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id uuid references public.plans(id) on delete cascade not null,
  amount numeric(10, 2) not null,
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  provider text not null check (provider in ('stripe', 'paypal')),
  provider_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.payments enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Plans policies
create policy "Users can view own plans" on public.plans
  for select using (auth.uid() = user_id);

create policy "Users can insert own plans" on public.plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update own plans" on public.plans
  for update using (auth.uid() = user_id);

create policy "Users can delete own plans" on public.plans
  for delete using (auth.uid() = user_id);

-- Payments policies
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id);

create policy "Users can insert own payments" on public.payments
  for insert with check (auth.uid() = user_id);

-- Indexes
create index plans_user_id_idx on public.plans(user_id);
create index plans_status_idx on public.plans(status);
create index payments_user_id_idx on public.payments(user_id);
create index payments_plan_id_idx on public.payments(plan_id);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger plans_updated_at
  before update on public.plans
  for each row execute procedure public.update_updated_at();
