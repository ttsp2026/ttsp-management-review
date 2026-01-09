import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging: Log to console if keys are missing (visible in browser F12)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Supabase keys are missing!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'Missing');
}

// Create the client safely
// If keys are missing, we pass empty strings to prevent the "White Screen" crash
// The app will load, but data fetching will fail (which is easier to debug)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);