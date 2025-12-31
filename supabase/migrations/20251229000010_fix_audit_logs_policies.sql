
-- 1. Ensure Table Exists
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  findings jsonb not null,
  risk_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ensure RLS is Enabled
alter table public.audit_logs enable row level security;

-- 3. Drop Policies if they exist (to allow re-creation without error)
drop policy if exists "Users can insert audit logs for their projects" on public.audit_logs;
drop policy if exists "Users can view audit logs for their projects" on public.audit_logs;

-- 4. Re-create Policies
create policy "Users can insert audit logs for their projects"
  on public.audit_logs for insert
  with check (auth.uid() in (select user_id from public.projects where id = project_id));

create policy "Users can view audit logs for their projects"
  on public.audit_logs for select
  using (auth.uid() in (select user_id from public.projects where id = project_id));
