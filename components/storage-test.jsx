"use client"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle, Upload, RefreshCw } from "lucide-react"
import Image from "next/image"

export function StorageTest() {
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [testImage, setTestImage] = useState(null)
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState(false)

  const testStorage = async () => {
    try {
      setLoading(true)
      setTestResults(null)
      setUploadedUrl("")
      setImagePreview(null)
      setImageError(false)

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Failed to initialize Supabase client")
      }

      // Step 1: Check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        throw new Error(`Failed to list buckets: ${bucketsError.message}`)
      }

      const bucketExists = buckets.some((bucket) => bucket.name === "transaction-receipts")

      // Step 2: Create the bucket if it doesn't exist
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

      // Step 3: Check bucket policies
      const { data: policies, error: policiesError } = await supabase
        .rpc("get_policies_for_bucket", {
          bucket_name: "transaction-receipts",
        })
        .catch(() => ({ data: null, error: { message: "Failed to get policies (RPC may not exist)" } }))

      // Step 4: Upload a test image
      let uploadResult = null
      if (testImage) {
        const fileExt = testImage.name.split(".").pop()
        const fileName = `test-${Date.now()}.${fileExt}`
        const filePath = `test/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("transaction-receipts")
          .upload(filePath, testImage, {
            cacheControl: "3600",
            upsert: true,
          })

        if (uploadError) {
          uploadResult = { success: false, error: uploadError.message }
        } else {
          const { data: urlData } = supabase.storage.from("transaction-receipts").getPublicUrl(filePath)

          uploadResult = {
            success: true,
            path: filePath,
            publicUrl: urlData.publicUrl,
          }

          setUploadedUrl(urlData.publicUrl)
        }
      }

      setTestResults({
        timestamp: new Date().toISOString(),
        buckets,
        bucketExists,
        createBucketResult,
        policies,
        uploadResult,
      })
    } catch (error) {
      console.error("Storage test error:", error)
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setTestImage(file)

    // Create image preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          Supabase Storage Test
        </CardTitle>
        <CardDescription>Test your Supabase storage configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="test-image">Test Image Upload</Label>
            <Input id="test-image" type="file" accept="image/*" onChange={handleFileChange} />

            {imagePreview && (
              <div className="mt-4 relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-md border">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Test image preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {testResults && (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Test Results</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Timestamp:</span> {testResults.timestamp}
                  </p>

                  {testResults.error ? (
                    <div className="text-red-500">
                      <p className="font-medium">Error:</p>
                      <p>{testResults.error}</p>
                    </div>
                  ) : (
                    <>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Bucket exists:</span>
                        {testResults.bucketExists ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </p>

                      {testResults.createBucketResult && (
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Bucket creation:</span>
                          {testResults.createBucketResult.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-red-500">{testResults.createBucketResult.error}</span>
                          )}
                        </p>
                      )}

                      {testResults.uploadResult && (
                        <div>
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Upload test:</span>
                            {testResults.uploadResult.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-red-500">{testResults.uploadResult.error}</span>
                            )}
                          </p>

                          {testResults.uploadResult.success && (
                            <p className="text-xs break-all mt-1">
                              <span className="font-medium">Path:</span> {testResults.uploadResult.path}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {uploadedUrl && (
                <div className="space-y-2">
                  <h3 className="font-medium">Uploaded Image URL</h3>
                  <p className="text-xs break-all">{uploadedUrl}</p>

                  <div className="mt-4 relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-md border">
                    <Image
                      src={uploadedUrl || "/placeholder.svg"}
                      alt="Uploaded image"
                      fill
                      className="object-contain"
                      onError={() => setImageError(true)}
                    />

                    {imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        Failed to load image
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testStorage} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Test Storage
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
