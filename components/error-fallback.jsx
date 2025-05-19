"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ErrorFallback({ title = "Error", description, retry, children }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{description || "Something went wrong. Please try again later."}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry} className="self-start mt-2">
            Try Again
          </Button>
        )}
        {children}
      </AlertDescription>
    </Alert>
  )
}
