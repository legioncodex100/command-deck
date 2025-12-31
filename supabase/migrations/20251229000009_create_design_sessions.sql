
CREATE TABLE IF NOT EXISTS design_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]'::JSONB,
    current_stitch_prompt TEXT,
    completed_stages TEXT[] DEFAULT '{}',
    current_complexity TEXT DEFAULT 'INTERMEDIATE',
    reconciled_code TEXT,
    last_mode TEXT DEFAULT 'PROMPT',
    current_design_doc TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE design_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
do $$
begin
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'design_sessions' and policyname = 'Users can view their own design sessions') then
        CREATE POLICY "Users can view their own design sessions" ON design_sessions FOR SELECT USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'design_sessions' and policyname = 'Users can insert their own design sessions') then
        CREATE POLICY "Users can insert their own design sessions" ON design_sessions FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'design_sessions' and policyname = 'Users can update their own design sessions') then
        CREATE POLICY "Users can update their own design sessions" ON design_sessions FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'design_sessions' and policyname = 'Users can delete their own design sessions') then
        CREATE POLICY "Users can delete their own design sessions" ON design_sessions FOR DELETE USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));
    end if;
end $$;
