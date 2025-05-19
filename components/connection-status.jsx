"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ConnectionStatus() {
  const [status, setStatus] = useState("checking") // checking, connected, error
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(false)

  const checkConnection = async () => {
    try {
      setStatus("checking")

      // Simple check - try to fetch categories which should be a lightweight request
      const response = await fetch("/api/categories")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to connect to database")
      }

      // If we get here, the connection is working
      setStatus("connected")
      setError(null)

      // Hide the alert after 3 seconds if connected
      setTimeout(() => {
        setVisible(false)
      }, 3000)
    } catch (error) {
      console.error("Connection check failed:", error)
      setStatus("error")
      setError(error.message)
      setVisible(true)
    }
  }

  useEffect(() => {
    checkConnection()

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  // Only show when there's an error or when first connected
  if (!visible && status !== "checking") return null

  return (
    <Alert
      variant={status === "error" ? "destructive" : "default"}
      className={`fixed bottom-4 right-4 w-auto max-w-md z-50 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {status === "checking" && <Wifi className="h-4 w-4 animate-pulse" />}
      {status === "connected" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      {status === "error" && <WifiOff className="h-4 w-4" />}

      <AlertTitle>
        {status === "checking" && "Checking connection..."}
        {status === "connected" && "Connected to database"}
        {status === "error" && "Connection Error"}
      </AlertTitle>

      <AlertDescription className="flex flex-col gap-2">
        {status === "checking" && <p>Verifying database connection...</p>}
        {status === "connected" && <p>Successfully connected to the database.</p>}
        {status === "error" && (
          <>
            <p>Failed to connect to the database: {error}</p>
            <p className="text-sm">Please check your environment variables and database configuration.</p>
            <Button size="sm" variant="outline" onClick={checkConnection} className="self-start mt-1">
              Retry Connection
            </Button>
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}
