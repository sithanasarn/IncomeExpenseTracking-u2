"use client"

import { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        console.log("Fetching recent transactions...")
        const response = await fetch("/api/transactions")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log(`Fetched ${data.length} transactions`)

        // Take only the 5 most recent transactions
        setTransactions(data.slice(0, 5))
        setError(null)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setError(error.message)
        toast({
          title: "Error",
          description: `Failed to load recent transactions: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center p-3 rounded-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 animate-pulse"></div>
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 w-3/4 bg-foreground/10 rounded animate-pulse"></div>
              <div className="h-3 w-1/2 bg-foreground/10 rounded animate-pulse"></div>
            </div>
            <div className="ml-auto text-right">
              <div className="h-4 w-16 bg-foreground/10 rounded animate-pulse"></div>
              <div className="h-3 w-12 bg-foreground/10 rounded animate-pulse mt-1"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load transactions. Please check your connection and try again.</AlertDescription>
      </Alert>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No transactions found. Add some transactions to see them here.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center p-3 rounded-md hover:bg-[#1c1c2a] transition-colors">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              transaction.type === "income"
                ? "bg-emerald-900/30 border border-emerald-500 income-glow"
                : "bg-red-900/30 border border-red-500 expense-glow",
            )}
          >
            {transaction.type === "income" ? (
              <ArrowUpIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">{transaction.categories?.name || "Uncategorized"}</p>
          </div>
          <div className="ml-auto text-right">
            <p
              className={cn(
                "text-sm font-medium",
                transaction.type === "income" ? "text-emerald-400 neon-text" : "text-red-400 neon-text",
              )}
            >
              {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount || 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {transaction.date ? new Date(transaction.date).toLocaleDateString() : "No date"}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
