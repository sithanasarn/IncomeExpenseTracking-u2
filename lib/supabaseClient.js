import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Optional: Add a check and log if variables are missing, helpful for debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. " +
    "The Supabase client may not be initialized correctly."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
