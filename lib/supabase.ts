import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

if (process.env.NODE_ENV !== 'production' && supabaseServiceKey.startsWith('http')) {
  console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY parece ser uma URL — verifique o .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side only — bypasses RLS. Never expose to the client.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
