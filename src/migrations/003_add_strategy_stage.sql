-- Add STRATEGY to Allowed Stages
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_current_stage_check;

ALTER TABLE projects 
ADD CONSTRAINT projects_current_stage_check 
CHECK (current_stage IN ('DISCOVERY', 'STRATEGY', 'DESIGN', 'SUBSTRUCTURE', 'CONSTRUCTION', 'AUDIT', 'HANDOVER', 'MAINTENANCE'));
