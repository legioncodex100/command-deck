-- Create Evolution Chat Messages Table
do $$
begin
  if not exists (select 1 from pg_type where typname = 'chat_role') then
    create type chat_role as enum ('user', 'assistant');
  end if;
end $$;

create table if not exists evolution_chat_messages (
  id uuid default gen_random_uuid() primary key,
  evolution_id uuid references evolutions(id) on delete cascade not null,
  role chat_role not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- RLS
alter table evolution_chat_messages enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'evolution_chat_messages' and policyname = 'Commanders can do everything on evolution_chat_messages') then
    create policy "Commanders can do everything on evolution_chat_messages"
      on evolution_chat_messages for all
      to authenticated
      using (
        exists (
          select 1 from profiles
          where profiles.id = auth.uid()
          and profiles.role = 'COMMANDER'
        )
      );
  end if;
end $$;

-- Index for faster retrieval by evolution_id
create index if not exists idx_evolution_chat_messages_evolution_id on evolution_chat_messages(evolution_id);
