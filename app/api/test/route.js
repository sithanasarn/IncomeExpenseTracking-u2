import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple test query to check if Supabase is connected
    const { data, error } = await supabase.from("categories").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test error:", error)
      return NextResponse.json({ error: error.message, connected: false }, { status: 500 })
    }

    return NextResponse.json({
      message: "Supabase connection successful",
      connected: true,
      data,
    })
  } catch (error) {
    console.error("API test route error:", error)
    return NextResponse.json({ error: error.message, connected: false }, { status: 500 })
  }
}
