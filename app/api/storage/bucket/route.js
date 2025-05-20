import { getSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

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
    const { bucketName = "transaction-receipts" } = body

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json({ error: `Failed to list buckets: ${listError.message}` }, { status: 500 })
    }

    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (bucketExists) {
      return NextResponse.json({
        success: true,
        message: `Bucket '${bucketName}' already exists`,
        bucket: buckets.find((bucket) => bucket.name === bucketName),
      })
    }

    // Create bucket
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 3000000, // 3MB
    })

    if (createError) {
      return NextResponse.json({ error: `Failed to create bucket: ${createError.message}` }, { status: 500 })
    }

    // Set up public access policies
    try {
      // Create a policy for public read access
      await supabase
        .rpc("create_storage_policy", {
          bucket_name: bucketName,
          policy_name: `allow_public_read_${bucketName}`,
          definition: `bucket_id = '${bucketName}'`,
          operation: "SELECT",
        })
        .catch((e) => console.warn("Policy creation may have failed:", e))

      // Create a policy for public write access
      await supabase
        .rpc("create_storage_policy", {
          bucket_name: bucketName,
          policy_name: `allow_public_write_${bucketName}`,
          definition: `bucket_id = '${bucketName}'`,
          operation: "INSERT",
        })
        .catch((e) => console.warn("Policy creation may have failed:", e))
    } catch (policyError) {
      console.warn("Error setting up policies:", policyError)
      // Continue anyway - the bucket was created
    }

    return NextResponse.json({
      success: true,
      message: `Bucket '${bucketName}' created successfully`,
      bucket: { name: bucketName, public: true },
    })
  } catch (error) {
    console.error("Error in bucket creation API:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    // Get the bucket name from query params
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get("name") || "transaction-receipts"

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json({ error: `Failed to list buckets: ${listError.message}` }, { status: 500 })
    }

    const bucket = buckets.find((b) => b.name === bucketName)

    return NextResponse.json({
      exists: !!bucket,
      bucket: bucket || null,
      allBuckets: buckets,
    })
  } catch (error) {
    console.error("Error in bucket check API:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
