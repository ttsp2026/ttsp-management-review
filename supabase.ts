import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// Use optional chaining to safely access .env, preventing crashes if it's undefined
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
