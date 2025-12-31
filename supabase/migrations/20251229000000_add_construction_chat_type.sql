ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE documents 
ADD CONSTRAINT documents_type_check 
CHECK (type IN (
  'PRD', 
  'STRATEGY', 
  'DESIGN', 
  'BACKLOG', 
  'SCHEMA', 
  'SPRINT',
  'PLANNING_CHAT',
  'CONSTRUCTION_CHAT'
)) NOT VALID;
