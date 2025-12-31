-- Migration: Seed Hangar Console Core Project
-- Description: Ensures the 'COMMAND_DECK_CORE' project exists for Host Governance.
-- Linked Implementation: Hangar Console (Meta-Project Seeding)

INSERT INTO projects (id, name, description, current_stage, user_id)
SELECT
  'c0de0000-0000-0000-0000-000000000000',
  'Command Deck (Host)',
  'The governance layer for the Command Deck platform. Managed by the Hangar Console.',
  'MAINTENANCE',
  id
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (id) DO NOTHING;
