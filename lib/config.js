// Environment configuration
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    isConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },
  app: {
    name: "Finance Tracker",
    version: "1.0.0",
  },
}

// Helper function to check if Supabase is properly configured
export function checkSupabaseConfig() {
  if (!config.supabase.isConfigured) {
    console.error(
      "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.",
    )
    return false
  }
  return true
}
