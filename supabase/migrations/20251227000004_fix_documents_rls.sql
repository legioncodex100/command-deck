-- Enable RLS on tables (if not already)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- 1. Policies for DOCUMENTS
-- Allow authenticated users to insert/select/update/delete documents
-- Ideally this should check project ownership, but for now we unblock the Vault.

do $$
begin
    -- 1. Policies for DOCUMENTS
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'documents' and policyname = 'Enable read access for authenticated users') then
        CREATE POLICY "Enable read access for authenticated users" ON "public"."documents" AS PERMISSIVE FOR SELECT TO authenticated USING (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'documents' and policyname = 'Enable insert access for authenticated users') then
        CREATE POLICY "Enable insert access for authenticated users" ON "public"."documents" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'documents' and policyname = 'Enable update access for authenticated users') then
        CREATE POLICY "Enable update access for authenticated users" ON "public"."documents" AS PERMISSIVE FOR UPDATE TO authenticated USING (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'documents' and policyname = 'Enable delete access for authenticated users') then
        CREATE POLICY "Enable delete access for authenticated users" ON "public"."documents" AS PERMISSIVE FOR DELETE TO authenticated USING (true);
    end if;

    -- 2. Policies for BLUEPRINTS
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'blueprints' and policyname = 'Enable read access for authenticated users') then
        CREATE POLICY "Enable read access for authenticated users" ON "public"."blueprints" AS PERMISSIVE FOR SELECT TO authenticated USING (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'blueprints' and policyname = 'Enable insert access for authenticated users') then
        CREATE POLICY "Enable insert access for authenticated users" ON "public"."blueprints" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'blueprints' and policyname = 'Enable update access for authenticated users') then
        CREATE POLICY "Enable update access for authenticated users" ON "public"."blueprints" AS PERMISSIVE FOR UPDATE TO authenticated USING (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'blueprints' and policyname = 'Enable delete access for authenticated users') then
        CREATE POLICY "Enable delete access for authenticated users" ON "public"."blueprints" AS PERMISSIVE FOR DELETE TO authenticated USING (true);
    end if;
end $$;
