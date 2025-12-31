-- supabase/migrations/20251231030000_create_invite_requests.sql
create table if not exists invite_requests (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- RLS
alter table invite_requests enable row level security;

-- Allow public to insert (request invite)
create policy "Public can request invite" 
  on invite_requests for insert 
  with check (true);

-- Allow admins to view (assuming service role or admin usage for now, or just leave restrictive)
-- For now, we just need insert access for the public.
