
-- Phase 12.2: Discovery Lab Persistence
-- Mirrors strategy_sessions for the Business Analysis pillar

CREATE TABLE IF NOT EXISTS discovery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,      -- Full chat history
    current_prd TEXT DEFAULT '-- Initializing PRD --', -- Live Draft
    completed_phases TEXT[] DEFAULT '{}',    -- ['VISION', 'AUDIENCE'...]
    current_phase_status TEXT DEFAULT 'INITIALIZING',
    last_persona TEXT DEFAULT 'INTERMEDIATE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for public usage" ON discovery_sessions
    FOR ALL USING (true) WITH CHECK (true);
