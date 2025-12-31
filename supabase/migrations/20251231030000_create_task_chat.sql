create table if not exists task_chat_messages (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references tasks(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table task_chat_messages enable row level security;

-- Create policy for full access
-- Create policy for full access
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'task_chat_messages' and policyname = 'Allow full access to task_chat_messages') then
    create policy "Allow full access to task_chat_messages"
      on task_chat_messages for all
      using (true)
      with check (true);
  end if;
end $$;
