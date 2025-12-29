-- Add unique constraint to allow UPSERT on (project_id, type)
ALTER TABLE documents ADD CONSTRAINT unique_project_id_type UNIQUE (project_id, type);
