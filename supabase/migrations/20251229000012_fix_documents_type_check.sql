-- Drop the existing check constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;

-- Re-add the constraint with STITCH_PROMPT included
ALTER TABLE documents ADD CONSTRAINT documents_type_check 
CHECK (type IN (
    'PRD', 'STRATEGY', 'DESIGN', 'SCHEMA', 'TECH_SPEC', 'USER_GUIDE', 'INSTRUCTIONS', 'BACKLOG', 'STITCH_PROMPT',
    'PLANNING_CHAT', 'CONSTRUCTION_CHAT', 'SPRINT',
    'RELAY_A', 'RELAY_B', 'RELAY_C', 'RELAY_D', 'RELAY_E', 'RELAY_F'
)) NOT VALID;
