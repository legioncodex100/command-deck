
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("Verifying schema...");
    // Try to select the specific column. If it doesn't exist, this should throw or return an error.
    const { data, error } = await supabase
        .from('design_sessions')
        .select('current_design_doc')
        .limit(1);

    if (error) {
        console.error("❌ Verification FAILED:", JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Verification SUCCESS: Column `current_design_doc` exists.");
    }
}

verify();
