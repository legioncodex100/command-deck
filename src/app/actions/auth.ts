"use server";

import { createClient } from "@/utils/supabase/server";

export async function forgotPassword(email: string) {
    const supabase = await createClient();

    // The redirect URL should point to the page where they handle the flow
    // In our case, the email link will verify the token and then redirect to /update-password
    // The 'redirectTo' param here is what is appended to the magic link
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://command-deck.dev';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updatePassword(password: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
