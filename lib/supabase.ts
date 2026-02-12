import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
        throw new Error(
            "CRITICAL: Supabase environment variables are missing in production! Check Vercel settings."
        );
    } else {
        console.warn(
            "⚠️ WARNING: Supabase URL or Anon Key missing. Database features will fail. Check your .env file."
        );
    }
}

export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key"
);
