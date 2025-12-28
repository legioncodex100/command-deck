-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blueprints Table
create table if not exists blueprints (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  content jsonb not null,
  version int not null default 1,
  created_at timestamptz default now()
);

-- Audit Logs Table
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  findings jsonb not null,
  risk_score int not null default 0,
  created_at timestamptz default now()
);

-- Documents Table (Phase 6)
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  type text not null check (type in ('PRD', 'TECH_SPEC', 'USER_GUIDE', 'DESIGN')),
  content text not null,
  created_at timestamptz default now()
);

-- RLS Policies
alter table projects enable row level security;
alter table blueprints enable row level security;
alter table audit_logs enable row level security;
alter table documents enable row level security;

-- Projects Policy
drop policy if exists "Users can view their own projects" on projects;
create policy "Users can view their own projects"
  on projects for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own projects" on projects;
create policy "Users can insert their own projects"
  on projects for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own projects" on projects;
create policy "Users can update their own projects"
  on projects for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own projects" on projects;
create policy "Users can delete their own projects"
  on projects for delete
  using ( auth.uid() = user_id );

-- Blueprints Policy (via project_id)
drop policy if exists "Users can view blueprints for their projects" on blueprints;
create policy "Users can view blueprints for their projects"
  on blueprints for select
  using ( exists ( select 1 from projects where id = blueprints.project_id and user_id = auth.uid() ) );

drop policy if exists "Users can insert blueprints for their projects" on blueprints;
create policy "Users can insert blueprints for their projects"
  on blueprints for insert
  with check ( exists ( select 1 from projects where id = blueprints.project_id and user_id = auth.uid() ) );

-- Audit Logs Policy (via project_id)
drop policy if exists "Users can view audit logs for their projects" on audit_logs;
create policy "Users can view audit logs for their projects"
  on audit_logs for select
  using ( exists ( select 1 from projects where id = audit_logs.project_id and user_id = auth.uid() ) );

drop policy if exists "Users can insert audit logs for their projects" on audit_logs;
create policy "Users can insert audit logs for their projects"
  on audit_logs for insert
  with check ( exists ( select 1 from projects where id = audit_logs.project_id and user_id = auth.uid() ) );

-- Documents Policy (via project_id)
drop policy if exists "Users can view documents for their projects" on documents;
create policy "Users can view documents for their projects"
  on documents for select
  using ( exists ( select 1 from projects where id = documents.project_id and user_id = auth.uid() ) );

drop policy if exists "Users can insert documents for their projects" on documents;
create policy "Users can insert documents for their projects"
  on documents for insert
  with check ( exists ( select 1 from projects where id = documents.project_id and user_id = auth.uid() ) );
