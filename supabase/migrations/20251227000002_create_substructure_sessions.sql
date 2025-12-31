-- Create a table to store Substructure Architect sessions
create table if not exists substructure_sessions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  messages jsonb default '[]'::jsonb,
  schema_sql text default '',
  completed_pillars text[] default array[]::text[],
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies (assuming public for now based on other tables, but good practice to enable)
alter table substructure_sessions enable row level security;

create policy "Users can view their own project sessions"
  on substructure_sessions for select
  using (auth.uid() = (select user_id from projects where id = substructure_sessions.project_id));

create policy "Users can insert their own project sessions"
  on substructure_sessions for insert
  with check (auth.uid() = (select user_id from projects where id = substructure_sessions.project_id));

create policy "Users can update their own project sessions"
  on substructure_sessions for update
  using (auth.uid() = (select user_id from projects where id = substructure_sessions.project_id));
