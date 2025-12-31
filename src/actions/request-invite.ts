'use server'

import { createClient } from "@supabase/supabase-js";

// Initialize a direct Supabase client for server actions
// We use the service role key to ensure we can write to the table even if policies are strict,
// OR we rely on the public key if the policy allows public inserts.
// Given the migration, we created a policy for public inserts.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function requestInvite(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;

    if (!email || !email.includes('@')) {
        return { message: 'Invalid email address.', success: false };
    }

    try {
        const { error } = await supabase
            .from('invite_requests')
            .insert([{ email }]);

        if (error) {
            console.error('Invite request error:', error);
            if (error.code === '23505') { // Unique violation if we enforced unique emails
                return { message: 'Signal already received.', success: true };
            }
            return { message: 'Transmission failed. Try again.', success: false };
        }

        return { message: 'Signal received. Stand by.', success: true };
    } catch (e) {
        console.error('Server action error:', e);
        return { message: 'System error.', success: false };
    }
}
