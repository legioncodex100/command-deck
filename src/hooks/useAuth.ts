import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        console.log("Attempting sign in for:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        console.log("Sign in result:", { data, error });

        if (error) throw error;

        // Check for "Unconfirmed Email" state
        if (data.user && !data.session) {
            throw new Error("Login successful, but email is not confirmed. Please check your inbox.");
        }

        return data;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return { user, loading, signInWithEmail, signOut };
}
