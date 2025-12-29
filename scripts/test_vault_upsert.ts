
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
    console.log("Testing Vault Upsert with Auth...");

    // 1. Sign In
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'mohammed@legiongrappling.com',
        password: '1859@purple'
    });

    if (authError || !authData.user) {
        console.error("AUTH FAILED:", authError);
        return;
    }
    console.log("Logged in as:", authData.user.email);

    // 2. Get a project
    const { data: projects, error: pError } = await supabase.from('projects').select('id').limit(1);
    if (pError || !projects || projects.length === 0) {
        console.error("Error getting project:", pError);
        return;
    }
    const projectId = projects[0].id;
    console.log("Using Project ID:", projectId);

    // 3. Try to Upsert DESIGN
    console.log("Attempting DESIGN upsert...");
    const { data: dData, error: dError } = await supabase.from('documents').upsert({
        project_id: projectId,
        type: 'DESIGN',
        content: '# Test Design Doc (Script)',
        title: 'Test Design DNA',
        summary: 'Persisted via debug script'
    }, { onConflict: 'project_id, type' }).select();

    if (dError) console.error("DESIGN UPSERT FAILED:", dError);
    else console.log("DESIGN UPSERT SUCCESS");

    // 4. Try to Upsert STITCH_PROMPT
    console.log("Attempting STITCH_PROMPT upsert...");
    const { data: sData, error: sError } = await supabase.from('documents').upsert({
        project_id: projectId,
        type: 'STITCH_PROMPT',
        content: '# Test Stitch Prompt (Script)',
        title: 'Test Stitch Prompt',
        summary: 'Persisted via debug script'
    }, { onConflict: 'project_id, type' }).select();

    if (sError) console.error("STITCH_PROMPT UPSERT FAILED:", sError);
    else console.log("STITCH_PROMPT UPSERT SUCCESS");
}

testUpsert();
