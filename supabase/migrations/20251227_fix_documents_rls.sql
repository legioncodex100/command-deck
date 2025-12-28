-- Enable RLS on tables (if not already)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- 1. Policies for DOCUMENTS
-- Allow authenticated users to insert/select/update/delete documents
-- Ideally this should check project ownership, but for now we unblock the Vault.

CREATE POLICY "Enable read access for authenticated users" ON "public"."documents"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON "public"."documents"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON "public"."documents"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON "public"."documents"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);


-- 2. Policies for BLUEPRINTS (Just in case they are also missing)

CREATE POLICY "Enable read access for authenticated users" ON "public"."blueprints"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON "public"."blueprints"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON "public"."blueprints"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON "public"."blueprints"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);
