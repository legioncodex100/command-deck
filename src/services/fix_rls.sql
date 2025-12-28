-- Fix RLS Policies for Documents Table

-- Ensure table exists and RLS is on
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  type text not null check (type in ('PRD', 'TECH_SPEC', 'USER_GUIDE', 'DESIGN')),
  content text not null,
  created_at timestamptz default now()
);

alter table documents enable row level security;

-- Drop potentially conflicting or malformed policies
drop policy if exists "Users can view documents for their projects" on documents;
drop policy if exists "Users can insert documents for their projects" on documents;
drop policy if exists "Users can view documents" on documents;
drop policy if exists "Users can insert documents" on documents;

-- Re-create Policies with explicit table aliasing for clarity
create policy "Users can view documents"
  on documents for select
  using (
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert documents"
  on documents for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Verify Project Policies (Just in case)
drop policy if exists "Users can view their own projects" on projects;
create policy "Users can view their own projects"
  on projects for select
  using ( auth.uid() = user_id );
