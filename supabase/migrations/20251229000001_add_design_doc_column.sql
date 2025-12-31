
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'design_sessions' AND column_name = 'current_design_doc') THEN
        ALTER TABLE design_sessions ADD COLUMN current_design_doc TEXT;
    END IF;
END $$;
