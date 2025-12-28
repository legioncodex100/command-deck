
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlueprints() {
    const { data: projects } = await supabase.from('projects').select('id, name').limit(1);
    if (!projects || projects.length === 0) {
        console.log("No projects found.");
        return;
    }
    const projectId = projects[0].id;
    console.log(`Checking blueprints for project: ${projects[0].name} (${projectId})`);

    const { data: blueprints, error } = await supabase
        .from('blueprints')
        .select('id, version, content')
        .eq('project_id', projectId);

    if (error) {
        console.error("Error fetching blueprints:", error);
    } else {
        console.log(`Found ${blueprints.length} blueprints:`);
        blueprints.forEach(b => {
            console.log(`- Version: ${b.version}`);
            console.log(`  Content Keys: ${Object.keys(b.content)}`);
            if (b.content.sql) {
                console.log(`  Has SQL: Yes (${b.content.sql.length} chars)`);
            } else {
                console.log(`  Has SQL: No`);
                console.log(`  Raw Content:`, JSON.stringify(b.content).substring(0, 100));
            }
        });
    }
}

checkBlueprints();
