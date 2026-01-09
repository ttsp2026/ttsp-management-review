import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are missing (Helps debugging deployment issues)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase Environment Variables are missing!');
}

// Create the client
// We use 'as string' to satisfy TypeScript, assuming variables are present
export const supabase = createClient(
  supabaseUrl as string, 
  supabaseAnonKey as string
);