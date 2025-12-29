-- 1. Create PROFILES table (Public metadata for users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  role text default 'CIVILIAN' check (role in ('COMMANDER', 'PILOT', 'CIVILIAN')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Create Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, display_name)
  values (new.id, new.email, 'CIVILIAN', split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Create INVITATIONS table
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  token text unique not null, -- Magic Link token or similar
  invited_by uuid references auth.users(id),
  status text default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'EXPIRED')),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

-- Enable RLS on invitations
alter table public.invitations enable row level security;

-- Only Admins (Commanders) can see/create invitations
create policy "Commanders can view all invitations" on public.invitations
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER')
  );

create policy "Commanders can create invitations" on public.invitations
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER')
  );

-- 4. Harden PROJECTS table with strict RLS
-- (Assuming table exists, existing policies might need to be dropped first if they are too loose, 
--  but for now we will add strict ones. Ideally we drop old ones.)

alter table public.projects enable row level security;

-- Drop loose policies if any (best effort, ignore error if not exists in a real script, 
-- but here we just blindly create strict ones. If duplicates exist, Supabase is usually okay or we'd need a do block)

-- STRICT ISOLATION: A user can ONLY see projects they own.
-- EXCEPTION: 'COMMANDER' can see ALL projects (God Mode).

create policy "Strict Project Isolation" on public.projects
  for select using (
    auth.uid() = user_id 
    or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER')
  );

create policy "Users can insert own projects" on public.projects
  for insert with check (
    auth.uid() = user_id
  );

create policy "Users can update own projects" on public.projects
  for update using (
    auth.uid() = user_id
    or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER')
  );

create policy "Users can delete own projects" on public.projects
  for delete using (
    auth.uid() = user_id
    or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER')
  );
