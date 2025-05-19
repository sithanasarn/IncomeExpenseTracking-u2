"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"

export function SupabaseTest() {
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState(null)

  const testConnection = async () => {
    try {
      setStatus("loading")
      setMessage("Testing connection to Supabase...")

      // Get the Supabase client
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Failed to initialize Supabase client. Check your environment variables.")
      }

      // Try a simple query to test the connection
      const { data, error } = await supabase.from("categories").select("count").limit(1)

      if (error) {
        throw error
      }

      // Get project details to confirm we're connected to the right project
      const { data: projectData } = await supabase.rpc("get_project_details").catch(() => ({ data: null }))

      setStatus("success")
      setMessage("Successfully connected to Supabase!")
      setDetails({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        categories: data,
        project: projectData,
      })
    } catch (error) {
      console.error("Supabase connection test failed:", error)
      setStatus("error")
      setMessage(`Connection failed: ${error.message}`)
      setDetails(error)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          {status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          Supabase Connection Test
        </CardTitle>
        <CardDescription>Verifying connection to your Supabase database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`p-4 rounded-md ${
              status === "loading"
                ? "bg-blue-500/10 text-blue-500"
                : status === "success"
                  ? "bg-green-500/10 text-green-500"
                  : status === "error"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-gray-100"
            }`}
          >
            <p>{message}</p>
          </div>

          {status === "success" && details && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Connected to:</strong> {details.url}
              </p>
              <p>
                <strong>Categories count:</strong> {details.categories?.[0]?.count || "Unknown"}
              </p>
            </div>
          )}

          {status === "error" && details && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Error code:</strong> {details.code || "Unknown"}
              </p>
              <p>
                <strong>Error details:</strong> {details.details || "No additional details"}
              </p>
              <p>
                <strong>Hint:</strong> {details.hint || "Check your environment variables and network connection"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection Again"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
