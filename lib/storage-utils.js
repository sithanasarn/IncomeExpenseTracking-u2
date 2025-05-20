import { getSupabaseClient } from "@/lib/supabase"

/**
 * Ensures that the specified storage bucket exists, with better error handling
 * @param {string} bucketName - The name of the bucket to check/create
 * @returns {Promise<{success: boolean, message: string, error: any}>} Result of the operation
 */
export async function ensureStorageBucketExists(bucketName = "transaction-receipts") {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return {
        success: false,
        message: "Supabase client not initialized",
        error: new Error("Supabase client not initialized"),
      }
    }

    console.log(`Checking if bucket '${bucketName}' exists...`)

    // First, check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return {
        success: false,
        message: `Error checking buckets: ${listError.message}`,
        error: listError,
      }
    }

    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists`)
      return { success: true, message: `Bucket '${bucketName}' exists`, error: null }
    }

    // Bucket doesn't exist, try to create it
    console.log(`Creating bucket '${bucketName}'...`)

    try {
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 3000000, // 3MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)

        // Special handling for permission errors
        if (createError.message.includes("permission") || createError.code === "42501") {
          return {
            success: false,
            message: `Permission denied: You don't have permission to create buckets. Please contact your administrator.`,
            error: createError,
          }
        }

        return {
          success: false,
          message: `Failed to create bucket: ${createError.message}`,
          error: createError,
        }
      }

      console.log(`Successfully created bucket '${bucketName}'`)
      return { success: true, message: `Bucket '${bucketName}' created successfully`, error: null }
    } catch (createCatchError) {
      console.error("Exception creating bucket:", createCatchError)
      return {
        success: false,
        message: `Exception creating bucket: ${createCatchError.message}`,
        error: createCatchError,
      }
    }
  } catch (error) {
    console.error("Error in ensureStorageBucketExists:", error)
    return {
      success: false,
      message: `Unexpected error: ${error.message}`,
      error: error,
    }
  }
}

/**
 * Uploads a file to a Supabase storage bucket with fallback options
 * @param {File} file - The file to upload
 * @param {string} bucketName - The name of the bucket to upload to
 * @param {Function} onProgress - Progress callback function
 * @param {Function} onDebug - Debug info callback function
 * @returns {Promise<{success: boolean, url: string|null, message: string, error: any}>}
 */
export async function uploadFileToStorage(file, bucketName = "transaction-receipts", onProgress, onDebug) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return {
        success: false,
        url: null,
        message: "Supabase client not initialized",
        error: new Error("Supabase client not initialized"),
      }
    }

    // Log debug info
    const logDebug = (message) => {
      console.log(message)
      if (onDebug) onDebug(message)
    }

    // Check if bucket exists
    logDebug(`Checking if bucket '${bucketName}' exists...`)

    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      logDebug(`Error listing buckets: ${listError.message}`)

      // Try to upload anyway - the bucket might exist even if we can't list buckets
      logDebug("Attempting upload despite bucket listing error...")
    } else {
      const bucketExists = buckets.some((bucket) => bucket.name === bucketName)
      logDebug(`Bucket '${bucketName}' ${bucketExists ? "exists" : "does not exist"}`)

      // If bucket doesn't exist and we can list buckets, try to create it
      if (!bucketExists) {
        logDebug(`Attempting to create bucket '${bucketName}'...`)

        try {
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 3000000, // 3MB
          })

          if (createError) {
            logDebug(`Error creating bucket: ${createError.message}`)
            // Continue anyway - we'll try to upload and see if it works
          } else {
            logDebug(`Successfully created bucket '${bucketName}'`)
          }
        } catch (createError) {
          logDebug(`Exception creating bucket: ${createError.message}`)
          // Continue anyway - we'll try to upload and see if it works
        }
      }
    }

    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `receipts/${fileName}`

    logDebug(`Uploading file: ${filePath}`)

    // Set initial progress
    if (onProgress) onProgress(10)

    // Upload the file
    const { data, error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      onUploadProgress: (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100)
        logDebug(`Upload progress: ${percent}%`)
        if (onProgress) onProgress(percent)
      },
    })

    if (uploadError) {
      logDebug(`Upload error: ${uploadError.message}`)
      return {
        success: false,
        url: null,
        message: `Upload failed: ${uploadError.message}`,
        error: uploadError,
      }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    if (!urlData || !urlData.publicUrl) {
      logDebug("Failed to get public URL for uploaded file")
      return {
        success: false,
        url: null,
        message: "Failed to get public URL for uploaded file",
        error: new Error("No public URL returned"),
      }
    }

    const publicUrl = urlData.publicUrl
    logDebug(`Upload successful! URL: ${publicUrl}`)

    return {
      success: true,
      url: publicUrl,
      message: "File uploaded successfully",
      error: null,
    }
  } catch (error) {
    console.error("Error in uploadFileToStorage:", error)
    return {
      success: false,
      url: null,
      message: `Unexpected error: ${error.message}`,
      error: error,
    }
  }
}
