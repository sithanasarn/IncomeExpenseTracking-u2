import { getSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    // Check if the storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({ error: `Storage error: ${bucketsError.message}`, connected: false }, { status: 500 })
    }

    // Check if our specific bucket exists
    const bucketExists = buckets.some((bucket) => bucket.name === "transaction-receipts")

    // Try to create the bucket if it doesn't exist
    let createBucketResult = null
    if (!bucketExists) {
      try {
        const { data, error } = await supabase.storage.createBucket("transaction-receipts", {
          public: true,
          fileSizeLimit: 3000000, // 3MB
        })
        createBucketResult = { success: !error, error: error?.message }
      } catch (err) {
        createBucketResult = { success: false, error: err.message }
      }
    }

    return NextResponse.json({
      connected: true,
      storage: {
        available: true,
        buckets: buckets.map((b) => b.name),
        transactionReceiptsBucketExists: bucketExists,
        createBucketResult,
      },
    })
  } catch (error) {
    console.error("API test storage route error:", error)
    return NextResponse.json({ error: error.message, connected: false }, { status: 500 })
  }
}
