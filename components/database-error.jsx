"use client"

import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function DatabaseError({ onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md border-red-500/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-500" />
            <CardTitle>Database Connection Error</CardTitle>
          </div>
          <CardDescription>Unable to connect to the database</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription>
              We couldn't connect to the database. This could be due to:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Missing or incorrect environment variables</li>
                <li>Database server is unavailable</li>
                <li>Network connectivity issues</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-4 text-sm">
            <p>Please check your environment configuration:</p>
            <pre className="bg-muted p-2 rounded-md mt-2 overflow-x-auto text-xs">
              <code>
                {`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </code>
            </pre>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onRetry} className="w-full">
            Retry Connection
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
