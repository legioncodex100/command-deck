
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStepPersistence() {
    console.log("Verifying `current_step` persistence column...");

    // 1. Check if column exists by selecting it
    const { data, error } = await supabase
        .from('design_sessions')
        .select('current_step')
        .limit(1);

    if (error) {
        console.error("❌ Verification FAILED:", JSON.stringify(error, null, 2));
        console.log("The user may have forgotten to run the SQL.");
    } else {
        console.log("✅ Column `current_step` detected.");
    }
}

verifyStepPersistence();
