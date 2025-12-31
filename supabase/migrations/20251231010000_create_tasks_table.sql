create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null,
  title text not null,
  description text,
  priority text not null check (priority in ('P0', 'P1', 'P2')),
  status text not null default 'todo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table tasks enable row level security;

-- Create policy for full access (for now, to unblock dev)
-- Create policy for full access (for now, to unblock dev)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'Allow full access to tasks') then
    create policy "Allow full access to tasks"
      on tasks for all
      using (true)
      with check (true);
  end if;
end $$;
