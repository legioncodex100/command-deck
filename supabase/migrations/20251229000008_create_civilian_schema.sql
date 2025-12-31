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
-- Policies for profiles
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Public profiles are viewable by everyone') then
    create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invitations' and policyname = 'Commanders can view all invitations') then
    create policy "Commanders can view all invitations" on public.invitations for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invitations' and policyname = 'Commanders can create invitations') then
    create policy "Commanders can create invitations" on public.invitations for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER'));
  end if;

  -- Projects Policies
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'Strict Project Isolation') then
    create policy "Strict Project Isolation" on public.projects for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'Users can insert own projects') then
    create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'Users can update own projects') then
    create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'Users can delete own projects') then
    create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'COMMANDER'));
  end if;
end $$;
