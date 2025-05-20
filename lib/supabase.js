import { createClient } from "@supabase/supabase-js"

// Create a singleton Supabase client
let supabaseClient = null

// Initialize the Supabase client
function initSupabase() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables. Check your .env.local file.")
      return null
    }

    console.log("Initializing Supabase client with URL:", supabaseUrl)
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Don't persist the session in localStorage
      },
      db: {
        schema: "public",
      },
    })
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    return null
  }
}

// Get the Supabase client (initialize if needed)
export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = initSupabase()
  }
  return supabaseClient
}

// For backward compatibility
export const supabase = getSupabaseClient()
