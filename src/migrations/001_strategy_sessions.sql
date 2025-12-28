-- Enable UUID extension if not exists
create extension if not exists "uuid-ossp";

-- Strategy Sessions Table
-- Persists the state of a Strategy Room consultation
create table if not exists strategy_sessions (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(id) on delete cascade not null,
    
    -- Analysis State
    messages jsonb default '[]'::jsonb, -- The full chat history array
    current_draft text default '',      -- The live STRATEGY.md content
    completed_pillars text[] default '{}', -- Array of completed pillar IDs
    
    -- Metadata
    last_persona text default 'INTERMEDIATE', -- The last used chat mode
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- RLS Policies
alter table strategy_sessions enable row level security;

create policy "Users can view sessions for their projects"
    on strategy_sessions for select
    using ( exists ( select 1 from projects where projects.id = strategy_sessions.project_id and projects.user_id = auth.uid() ) );

create policy "Users can insert sessions for their projects"
    on strategy_sessions for insert
    with check ( exists ( select 1 from projects where projects.id = strategy_sessions.project_id and projects.user_id = auth.uid() ) );

create policy "Users can update sessions for their projects"
    on strategy_sessions for update
    using ( exists ( select 1 from projects where projects.id = strategy_sessions.project_id and projects.user_id = auth.uid() ) );
