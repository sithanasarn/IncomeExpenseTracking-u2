"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle, RefreshCw, Database } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ensureStorageBucketExists } from "@/lib/storage-utils"

export function BucketManager() {
  const [loading, setLoading] = useState(false)
  const [buckets, setBuckets] = useState([])
  const [error, setError] = useState(null)
  const [creatingBucket, setCreatingBucket] = useState(false)
  const [bucketStatus, setBucketStatus] = useState(null)

  // Fetch all buckets
  const fetchBuckets = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        throw new Error(`Failed to list buckets: ${bucketsError.message}`)
      }

      setBuckets(data || [])

      // Check if our target bucket exists
      const transactionBucket = data?.find((bucket) => bucket.name === "transaction-receipts")
      setBucketStatus(transactionBucket ? "exists" : "missing")
    } catch (err) {
      console.error("Error fetching buckets:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create the transaction-receipts bucket
  const createBucket = async () => {
    try {
      setCreatingBucket(true)
      setError(null)

      const { success, message } = await ensureStorageBucketExists("transaction-receipts")

      if (!success) {
        throw new Error(message)
      }

      toast({
        title: "Success",
        description: message,
      })

      // Refresh the bucket list
      await fetchBuckets()
    } catch (err) {
      console.error("Error creating bucket:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
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
            <Button onClick={createBucket} disabled={creatingBucket} className="w-full mt-2">
              {creatingBucket ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Bucket...
                </>
              ) : (
                "Create transaction-receipts Bucket"
              )}
            </Button>
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
