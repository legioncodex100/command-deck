
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
}

if (!serviceRoleKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Trying anon key but RLS might block results.');
}

const supabaseKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('Missing both SERVICE_ROLE_KEY and ANON_KEY');
    process.exit(1);
}

console.log('Using key type:', serviceRoleKey ? 'SERVICE_ROLE' : 'ANON');

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, current_stage');

    if (error) {
        console.error('Error fetching projects:', error);
        return;
    }

    console.log('Projects:', projects);
}

main();
