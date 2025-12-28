
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("--- PROJECTS ---");
    const { data: projects, error: pError } = await supabase.from('projects').select('id, name, current_stage, created_at').order('created_at', { ascending: false });
    if (pError) console.error(pError);
    else console.table(projects);

    console.log("\n--- DOCUMENTS ---");
    const { data: docs, error: dError } = await supabase.from('documents').select('id, project_id, type, created_at, content').order('created_at', { ascending: false });
    if (dError) console.error(dError);
    else {
        // Show summary to avoid huge content dump
        const summary = docs?.map(d => ({
            id: d.id,
            project_id: d.project_id,
            type: d.type,
            created_at: d.created_at,
            contentPrefix: typeof d.content === 'string' ? d.content.substring(0, 50) + "..." : "OBJECT/NULL"
        }));
        console.table(summary);
    }
}

main();
