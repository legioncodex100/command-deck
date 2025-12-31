-- Create Evolutions Table
do $$
begin
  if not exists (select 1 from pg_type where typname = 'evolution_status') then
    create type evolution_status as enum ('IDEA', 'PLANNED', 'PUSHED', 'COMPLETED');
  end if;
end $$;

create table if not exists evolutions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status evolution_status default 'IDEA',
  spec_content text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table evolutions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'evolutions' and policyname = 'Commanders can do everything on evolutions') then
    create policy "Commanders can do everything on evolutions"
      on evolutions for all
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
