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

    // Create the client with more detailed options
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Don't persist the session in localStorage
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "x-application-name": "finance-tracker",
        },
      },
    })

    // Test the client with a simple query
    client
      .from("categories")
      .select("count", { count: "exact", head: true })
      .then(({ error }) => {
        if (error) {
          console.error("Supabase client test query failed:", error)
        } else {
          console.log("Supabase client initialized and tested successfully")
        }
      })
      .catch((err) => {
        console.error("Error testing Supabase client:", err)
      })

    return client
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    return null
  }
}

// Get the Supabase client (initialize if needed)
export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = initSupabase()

    // Log initialization status
    if (supabaseClient) {
      console.log("Supabase client initialized successfully")
    } else {
      console.error("Failed toinitialize Supabase client")
    }
  }
  return supabaseClient
}

// For backward compatibility
export const supabase = getSupabaseClient()
