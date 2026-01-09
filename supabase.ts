import { createClient } from '@supabase/supabase-js';

// 1. Get environment variables using Vite's standard syntax
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Safety Check: Log an error if keys are missing
// This helps you verify if Vercel environment variables are actually working
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase Environment Variables are missing! Please check Vercel Settings.');
}

// 3. Create and Export the Client
// We use 'as string' to satisfy TypeScript
export const supabase = createClient(
  supabaseUrl as string, 
  supabaseAnonKey as string
);