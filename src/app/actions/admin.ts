"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function inviteCivilian(email: string) {
    // 1. Verify Requestor is a Commander
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'COMMANDER') {
        return { error: "Access Denied: Commanders Only" };
    }

    // 2. Send Invite via Admin API
    const adminClient = createAdminClient();

    // Generates a link like: site.com/update-password?access_token=...
    // We explicitly set the redirect to /update-password to ensure they land on the setup page
    // Using the configured Site URL from Supabase settings is safest if we don't have a specific ENV
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: 'https://command-deck.dev/update-password'
    });

    if (error) {
        console.error("Invite Error:", error);
        return { error: error.message };
    }

    // 3. Log Invitation in our table
    if (data.user) {
        // Invite successful, record it
        // Note: We don't have the token explicitly here usually, Supabase sends the email.
        // But for our table we just valid record creation

        await adminClient.from('invitations').insert({
            email: email,
            token: 'supabase-magic-link', // Placeholder as Supabase handles the token
            invited_by: user.id,
            status: 'PENDING'
        });
    }

    return { success: true, message: `Invitation sent to ${email}` };
}

export const resendInvite = inviteCivilian;
