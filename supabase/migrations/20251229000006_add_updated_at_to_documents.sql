-- Add updated_at column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update existing rows to have a value (if any were null, though default handles new ones)
UPDATE documents SET updated_at = created_at WHERE updated_at IS NULL;
