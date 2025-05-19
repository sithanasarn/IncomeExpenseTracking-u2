import { getSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

// Get all transactions
export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    console.log("Fetching all transactions...")

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order("date", { ascending: false })

    if (error) {
      console.error("Supabase error fetching transactions:", error)
      return NextResponse.json({ error: `Transactions error: ${error.message}` }, { status: 500 })
    }

    // Return empty array if no data to avoid null errors
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Server error in transactions API:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}

// Create a new transaction
export async function POST(request) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          amount: body.amount,
          type: body.type,
          description: body.description,
          category_id: body.category_id,
          date: body.date,
        },
      ])
      .select()

    if (error) {
      console.error("Error adding transaction:", error)
      return NextResponse.json({ error: `Add transaction error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Server error in POST transactions:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
