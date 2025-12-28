-- Fix RLS policies for substructure_sessions to be more permissive for debugging/development
-- PROCEED WITH CAUTION: This allows any authenticated user to read/write all sessions.
-- Revert to strict policies for production.

alter table substructure_sessions disable row level security;
alter table substructure_sessions enable row level security;

-- Drop existing strict policies
drop policy if exists "Users can view their own project sessions" on substructure_sessions;
drop policy if exists "Users can insert their own project sessions" on substructure_sessions;
drop policy if exists "Users can update their own project sessions" on substructure_sessions;

-- Create permissive policies for authenticated users
create policy "Enable all access for authenticated users"
  on substructure_sessions
  for all
  to authenticated
  using (true)
  with check (true);
