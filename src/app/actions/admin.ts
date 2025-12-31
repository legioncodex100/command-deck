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

    return { success: true };
}

export async function deleteUser(userId: string) {
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

    const adminClient = createAdminClient();

    // Delete from Auth (cascades to profiles usually, but we should be sure)
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) return { error: error.message };

    return { success: true };
}


export async function sendMagicLink(email: string) {
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

    // Admin-triggered magic link (sends email to user)
    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            emailRedirectTo: 'https://command-deck.dev/' // or Site URL
        }
    });

    if (error) return { error: error.message };
    return { success: true };
}

export async function triggerPasswordReset(email: string) {
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

    // Admin-triggered password reset
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://command-deck.dev';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
    });

    if (error) return { error: error.message };
    return { success: true };
}


export async function listCiviliansWithAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Check if requester is Commander
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'COMMANDER') {
        return { error: "Access Denied" };
    }

    // 1. Fetch all profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (profileError) return { error: profileError.message };

    // 2. Fetch all Auth Users (to get last_sign_in_at)
    const adminClient = createAdminClient();
    const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers();

    if (authError) {
        console.error("Auth Fetch Error:", authError);
        // Fallback to just profiles if auth fetch fails
        return { data: profiles };
    }

    // 3. Merge Data
    const mergedData = profiles.map(p => {
        const authUser = users.find(u => u.id === p.id);
        return {
            ...p,
            last_sign_in_at: authUser?.last_sign_in_at || null
        };
    });

    return { data: mergedData };
}

export const resendInvite = inviteCivilian;
