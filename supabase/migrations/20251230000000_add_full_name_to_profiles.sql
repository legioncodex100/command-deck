-- Add full_name column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name text;

-- Optional: Copy display_name to full_name if empty initially
UPDATE profiles 
SET full_name = display_name 
WHERE full_name IS NULL;
