"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle, RefreshCw, Database, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function BucketManager() {
  const [loading, setLoading] = useState(false)
  const [buckets, setBuckets] = useState([])
  const [error, setError] = useState(null)
  const [creatingBucket, setCreatingBucket] = useState(false)
  const [bucketStatus, setBucketStatus] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  // Fetch all buckets using the API
  const fetchBuckets = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo("Fetching buckets...")

      // Use the API route instead of direct Supabase client
      const response = await fetch("/api/storage/bucket?name=transaction-receipts")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setDebugInfo((prev) => `${prev}\nReceived bucket data: ${JSON.stringify(data, null, 2)}`)

      setBuckets(data.allBuckets || [])
      setBucketStatus(data.exists ? "exists" : "missing")
    } catch (err) {
      console.error("Error fetching buckets:", err)
      setError(err.message)
      setDebugInfo((prev) => `${prev}\nError: ${err.message}`)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create the transaction-receipts bucket using the API
  const createBucket = async () => {
    try {
      setCreatingBucket(true)
      setError(null)
      setDebugInfo("Creating bucket via API...")

      const response = await fetch("/api/storage/bucket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bucketName: "transaction-receipts" }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setDebugInfo((prev) => `${prev}\nAPI response: ${JSON.stringify(data, null, 2)}`)

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })

        // Refresh the bucket list
        await fetchBuckets()
      } else {
        throw new Error(data.message || "Unknown error creating bucket")
      }
    } catch (err) {
      console.error("Error creating bucket:", err)
      setError(err.message)
      setDebugInfo((prev) => `${prev}\nError: ${err.message}`)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setCreatingBucket(false)
    }
  }

  // Try direct Supabase client as fallback
  const createBucketFallback = async () => {
    try {
      setCreatingBucket(true)
      setError(null)
      setDebugInfo("Attempting direct bucket creation as fallback...")

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data, error: createError } = await supabase.storage.createBucket("transaction-receipts", {
        public: true,
        fileSizeLimit: 3000000, // 3MB
      })

      if (createError) {
        throw createError
      }

      setDebugInfo((prev) => `${prev}\nBucket created successfully via direct client`)
      toast({
        title: "Success",
        description: "Storage bucket created successfully via fallback method",
      })

      // Refresh the bucket list
      await fetchBuckets()
    } catch (err) {
      console.error("Error in fallback bucket creation:", err)
      setError(`Fallback also failed: ${err.message}`)
      setDebugInfo((prev) => `${prev}\nFallback error: ${err.message}`)
      toast({
        title: "Error",
        description: `Fallback method also failed: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setCreatingBucket(false)
    }
  }

  // Load buckets on component mount
  useEffect(() => {
    fetchBuckets()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Storage Bucket Manager
        </CardTitle>
        <CardDescription>Manage Supabase storage buckets for receipt images</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Transaction Receipts Bucket</h3>
            <div className="flex items-center">
              {bucketStatus === "exists" && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
              {bucketStatus === "missing" && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
              <span className={bucketStatus === "exists" ? "text-green-500" : "text-red-500"}>
                {bucketStatus === "exists" ? "Available" : "Not Found"}
              </span>
            </div>
          </div>

          {bucketStatus === "missing" && (
            <div className="space-y-2">
              <Button onClick={createBucket} disabled={creatingBucket} className="w-full">
                {creatingBucket ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Bucket...
                  </>
                ) : (
                  "Create transaction-receipts Bucket"
                )}
              </Button>

              <Button onClick={createBucketFallback} disabled={creatingBucket} variant="outline" className="w-full">
                Try Alternative Method
              </Button>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">All Storage Buckets</h3>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Loading buckets...</span>
            </div>
          ) : buckets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No storage buckets found</div>
          ) : (
            <ul className="space-y-2">
              {buckets.map((bucket) => (
                <li key={bucket.id} className="p-2 bg-[#13131a] rounded-md flex justify-between items-center">
                  <span>{bucket.name}</span>
                  <span className={`text-xs ${bucket.public ? "text-green-500" : "text-yellow-500"}`}>
                    {bucket.public ? "Public" : "Private"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="mt-4 p-3 bg-[#13131a] border border-[#2a2a3c] rounded-md text-xs text-gray-300 overflow-auto max-h-48">
            <h4 className="font-medium mb-1 text-emerald-400">Debug Information</h4>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={fetchBuckets} disabled={loading} variant="outline" className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Buckets
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
