import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== "undefined") {
    console.error("CRITICAL ERROR: Supabase Identifiers missing from Client.");
  }
}

// Use createBrowserClient for Cookie Support (Cookies are essential for Middleware)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
