-- Create a table to store consultation logs for various pillars
create table if not exists consultation_logs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  pillar text not null, -- e.g., 'DESIGN', 'STRATEGY', 'CONSTRUCTION'
  messages jsonb default '[]'::jsonb, -- Array of {role: 'user'|'model', text: string}
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, pillar) -- One log per pillar per project
);

-- Add RLS policies
alter table consultation_logs enable row level security;

create policy "Users can view their own project consultation logs"
  on consultation_logs for select
  using (auth.uid() = (select user_id from projects where id = consultation_logs.project_id));

create policy "Users can insert their own project consultation logs"
  on consultation_logs for insert
  with check (auth.uid() = (select user_id from projects where id = consultation_logs.project_id));

create policy "Users can update their own project consultation logs"
  on consultation_logs for update
  using (auth.uid() = (select user_id from projects where id = consultation_logs.project_id));
