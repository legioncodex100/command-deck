alter table evolutions
add column if not exists tasks_draft jsonb default '[]'::jsonb;
