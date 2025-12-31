-- Drop the existing check constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;

-- Re-add the constraint with SPRINT included
ALTER TABLE documents ADD CONSTRAINT documents_type_check 
CHECK (type IN ('PRD', 'STRATEGY', 'DESIGN', 'SCHEMA', 'TECH_SPEC', 'USER_GUIDE', 'INSTRUCTIONS', 'BACKLOG', 'STITCH_PROMPT', 'SPRINT')) NOT VALID;
