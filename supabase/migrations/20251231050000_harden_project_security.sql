-- Security Hardening: Enforce Strict Project Isolation

-- 1. Enable RLS (Idempotent)
alter table public.projects enable row level security;

-- 2. Drop existing potentially permissive policies to start fresh
drop policy if exists "Strict Project Isolation" on public.projects;
drop policy if exists "Users can insert own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;

-- 3. Re-create Strict Policies

-- SELECT: Only the owner can see the project. No admin override.
create policy "Strict Project Isolation"
on public.projects
for select
using (
    auth.uid() = user_id
);

-- INSERT: Only authenticated users can create projects for themselves.
create policy "Users can insert own projects"
on public.projects
for insert
with check (
    auth.uid() = user_id
);

-- UPDATE: Only the owner can update the project.
create policy "Users can update own projects"
on public.projects
for update
using (
    auth.uid() = user_id
);

-- DELETE: Only the owner can delete the project.
create policy "Users can delete own projects"
on public.projects
for delete
using (
    auth.uid() = user_id
);
