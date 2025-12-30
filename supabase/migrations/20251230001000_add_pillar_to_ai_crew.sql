-- Add pillar column to ai_crew
ALTER TABLE public.ai_crew 
ADD COLUMN pillar text;

-- Add constraint to ensure valid pillars
ALTER TABLE public.ai_crew
ADD CONSTRAINT valid_pillar_check 
CHECK (pillar IN ('Discovery', 'Strategy', 'Substructure', 'Design', 'Planning', 'Construction', 'Integration', 'Operations'));

-- Update existing agents with their correct Pillar

-- 1. Discovery
UPDATE public.ai_crew SET pillar = 'Discovery' WHERE key = 'senior_business_analyst'; -- Quark

-- 2. Strategy
UPDATE public.ai_crew SET pillar = 'Strategy' WHERE key IN ('lead_systems_architect', 'product_manager'); -- Seven, Sisko

-- 3. Substructure
UPDATE public.ai_crew SET pillar = 'Substructure' WHERE key IN ('tech_lead', 'solutions_architect'); -- Data, Tuvok

-- 4. Design
UPDATE public.ai_crew SET pillar = 'Design' WHERE key = 'facade_architect'; -- Garak

-- 5. Planning
UPDATE public.ai_crew SET pillar = 'Planning' WHERE key IN ('senior_tech_pm', 'engineering_director'); -- Chakotay, Picard

-- 6. Construction
UPDATE public.ai_crew SET pillar = 'Construction' WHERE key IN ('lead_engineer', 'senior_software_engineer'); -- O'Brien, Torres

-- 7. Integration
UPDATE public.ai_crew SET pillar = 'Integration' WHERE key IN ('structural_inspector', 'release_manager'); -- Odo, Geordi

-- Operations (Default for anyone else or specific roles like 'bartender' if added later)
-- For now, ensure not null for existing.
UPDATE public.ai_crew SET pillar = 'Operations' WHERE pillar IS NULL;

-- Make pillar required getting forward (optional, but good practice if we want strictness)
-- ALTER TABLE public.ai_crew ALTER COLUMN pillar SET NOT NULL;
