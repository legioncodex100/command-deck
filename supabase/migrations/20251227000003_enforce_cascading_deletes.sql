-- Enforce ON DELETE CASCADE for all tables referencing projects

-- 1. Documents
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_project_id_fkey;

ALTER TABLE documents
ADD CONSTRAINT documents_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

-- 2. Blueprints
ALTER TABLE blueprints
DROP CONSTRAINT IF EXISTS blueprints_project_id_fkey;

ALTER TABLE blueprints
ADD CONSTRAINT blueprints_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

-- 3. Discovery Sessions
ALTER TABLE discovery_sessions
DROP CONSTRAINT IF EXISTS discovery_sessions_project_id_fkey;

ALTER TABLE discovery_sessions
ADD CONSTRAINT discovery_sessions_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

-- 4. Substructure Sessions (Already done in creation, but reinforcing)
ALTER TABLE substructure_sessions
DROP CONSTRAINT IF EXISTS substructure_sessions_project_id_fkey;

ALTER TABLE substructure_sessions
ADD CONSTRAINT substructure_sessions_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

-- 5. Audit Logs (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_project_id_fkey;
        
        ALTER TABLE audit_logs
        ADD CONSTRAINT audit_logs_project_id_fkey
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE;
    END IF;
END $$;
