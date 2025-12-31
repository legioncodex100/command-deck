-- Add unique constraint to allow UPSERT on (project_id, type)
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'unique_project_id_type') then
        ALTER TABLE documents ADD CONSTRAINT unique_project_id_type UNIQUE (project_id, type);
    end if;
end $$;
