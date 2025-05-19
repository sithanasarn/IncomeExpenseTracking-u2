"use client"

import { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon, Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function TransactionsTable() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      console.log("Fetching transactions for table...")
      const response = await fetch("/api/transactions")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`Fetched ${data.length} transactions for table`)
      setTransactions(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to load transactions: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filter !== "all" && transaction.type !== filter) {
      return false
    }

    // Filter by search term
    if (
      search &&
      !transaction.description?.toLowerCase().includes(search.toLowerCase()) &&
      !transaction.categories?.name?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }

    return true
  })

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
        throw new Error(errorMessage)
      }

      setTransactions(transactions.filter((t) => t.id !== id))
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed.",
      })
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1">
            <div className="h-10 w-48 bg-foreground/10 rounded animate-pulse"></div>
          </div>
          <div className="w-[180px] h-10 bg-foreground/10 rounded animate-pulse"></div>
        </div>
        <div className="rounded-md border border-[#2a2a3c] overflow-hidden">
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-32 bg-foreground/10 rounded animate-pulse"></div>
          </div>
        </div>
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-[#2a2a3c] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#13131a]">
            <TableRow>
              <TableHead className="text-foreground/70">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-[#1c1c2a] transition-colors">
                  <TableCell className="font-medium">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : "No date"}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.categories?.name || "Uncategorized"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <div
                        className={cn(
                          "mr-2 flex h-6 w-6 items-center justify-center rounded-full",
                          transaction.type === "income"
                            ? "bg-emerald-900/30 border border-emerald-500 income-glow"
                            : "bg-red-900/30 border border-red-500 expense-glow",
                        )}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <span
                        className={cn(
                          transaction.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
