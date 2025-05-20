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
    console.log("Received transaction data:", body)

    // Validate required fields
    if (!body.amount || !body.type || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields: amount, type, and description are required" },
        { status: 400 },
      )
    }

    // Insert transaction with or without receipt_image
    const transactionData = {
      amount: body.amount,
      type: body.type,
      description: body.description,
      date: body.date,
    }

    // Only add category_id if it exists and is not empty
    if (body.category_id && body.category_id.trim() !== "") {
      transactionData.category_id = body.category_id
    }

    // Only add receipt_image if it exists
    if (body.receipt_image) {
      transactionData.receipt_image = body.receipt_image
    }

    console.log("Inserting transaction:", transactionData)
    const { data, error } = await supabase.from("transactions").insert([transactionData]).select()

    if (error) {
      console.error("Error adding transaction:", error)
      return NextResponse.json({ error: `Add transaction error: ${error.message}` }, { status: 500 })
    }

    console.log("Transaction added successfully:", data[0])
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Server error in POST transactions:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
