-- Add title and summary columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Comment: This allows storing specific document names and short descriptions.
