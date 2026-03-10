import { createClient } from '@supabase/supabase-js';

// No momento do build na Vercel, se as variáveis de ambiente não estiverem definidas,
// usamos placeholders para evitar erro de inicialização do cliente Supabase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
