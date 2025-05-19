import { getSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

// Get a specific transaction
export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    const { id } = params

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update a transaction
export async function PUT(request, { params }) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from("transactions")
      .update({
        amount: body.amount,
        type: body.type,
        description: body.description,
        category_id: body.category_id,
        date: body.date,
      })
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete a transaction
export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    const { id } = params

    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
