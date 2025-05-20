import { getSupabaseClient } from "@/lib/supabase"

/**
 * Ensures that the specified storage bucket exists, creating it if necessary
 * @param {string} bucketName - The name of the bucket to check/create
 * @returns {Promise<{success: boolean, message: string}>} Result of the operation
 */
export async function ensureStorageBucketExists(bucketName = "transaction-receipts") {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabase client not initialized" }
    }

    console.log(`Checking if bucket '${bucketName}' exists...`)

    // First, check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, message: `Error checking buckets: ${listError.message}` }
    }

    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists`)
      return { success: true, message: `Bucket '${bucketName}' exists` }
    }

    // Bucket doesn't exist, create it
    console.log(`Creating bucket '${bucketName}'...`)
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 3000000, // 3MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    })

    if (createError) {
      console.error("Error creating bucket:", createError)
      return { success: false, message: `Failed to create bucket: ${createError.message}` }
    }

    console.log(`Successfully created bucket '${bucketName}'`)

    // Set up public access policies for the bucket
    try {
      // This is a simplified approach - in a production app, you might want more granular policies
      const { error: policyError } = await supabase.storage.from(bucketName).createSignedUrl("dummy.txt", 1)
      if (policyError && !policyError.message.includes("not found")) {
        console.warn("Note: There might be issues with bucket policies:", policyError)
      }
    } catch (policyError) {
      console.warn("Note: Error checking policies:", policyError)
    }

    return { success: true, message: `Bucket '${bucketName}' created successfully` }
  } catch (error) {
    console.error("Error in ensureStorageBucketExists:", error)
    return { success: false, message: `Unexpected error: ${error.message}` }
  }
}
