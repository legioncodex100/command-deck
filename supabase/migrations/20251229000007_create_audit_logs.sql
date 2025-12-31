
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  findings jsonb not null,
  risk_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'Users can insert audit logs for their projects') then
    create policy "Users can insert audit logs for their projects"
      on public.audit_logs for insert
      with check (auth.uid() in (select user_id from public.projects where id = project_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'Users can view audit logs for their projects') then
    create policy "Users can view audit logs for their projects"
      on public.audit_logs for select
      using (auth.uid() in (select user_id from public.projects where id = project_id));
  end if;
end $$;
