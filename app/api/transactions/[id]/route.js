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

    if (!data) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
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
        receipt_image: body.receipt_image,
      })
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
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

    // First, check if the transaction has a receipt image
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("receipt_image")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // If there's a receipt image, delete it from storage
    if (transaction?.receipt_image) {
      // Extract the file path from the URL
      const url = new URL(transaction.receipt_image)
      const pathParts = url.pathname.split("/")
      const filePath = pathParts.slice(pathParts.indexOf("transaction-receipts") + 1).join("/")

      if (filePath) {
        const { error: storageError } = await supabase.storage.from("transaction-receipts").remove([filePath])

        if (storageError) {
          console.error("Error deleting receipt image:", storageError)
          // Continue with transaction deletion even if image deletion fails
        }
      }
    }

    // Delete the transaction
    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
