-- Fix Stage Logic for Projects Table

-- 1. Add columns if they don't exist
alter table projects 
add column if not exists current_stage text default 'DISCOVERY' check (current_stage in ('DISCOVERY', 'DESIGN', 'SUBSTRUCTURE', 'CONSTRUCTION', 'AUDIT', 'HANDOVER', 'MAINTENANCE')),
add column if not exists is_completed boolean default false;

-- 2. Backfill existing projects (optional, but good for safety)
update projects set current_stage = 'DISCOVERY' where current_stage is null;

-- 3. Verify Documents Table (ensure it exists from Phase 6)
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  type text not null check (type in ('PRD', 'TECH_SPEC', 'USER_GUIDE', 'DESIGN')),
  content text not null,
  created_at timestamptz default now()
);

-- 4. Enable RLS (Redundant check)
alter table projects enable row level security;
alter table documents enable row level security;

-- 5. No new policies needed for 'projects' as we are just adding columns to existing RLS-protected table.
