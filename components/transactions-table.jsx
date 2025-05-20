"use client"

import { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon, Trash2, AlertCircle, ImageIcon, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

export function TransactionsTable() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

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

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction)
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
              <TableHead className="text-center">Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
                  <TableCell className="text-center">
                    {transaction.receipt_image ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-emerald-500 hover:text-emerald-400 relative"
                        onClick={() => viewTransactionDetails(transaction)}
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span className="sr-only">View Receipt</span>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">No receipt</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => viewTransactionDetails(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>
                    {selectedTransaction.date ? new Date(selectedTransaction.date).toLocaleDateString() : "No date"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className={selectedTransaction.type === "income" ? "text-emerald-400" : "text-red-400"}>
                    {selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className={selectedTransaction.type === "income" ? "text-emerald-400" : "text-red-400"}>
                    ${Number(selectedTransaction.amount || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p>{selectedTransaction.categories?.name || "Uncategorized"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p>{selectedTransaction.description}</p>
              </div>
              {selectedTransaction?.receipt_image && (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[#2a2a3c]">
                    <Image
                      src={selectedTransaction.receipt_image || "/placeholder.svg"}
                      alt="Receipt"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 400px"
                      onError={(e) => {
                        console.error("Image failed to load:", selectedTransaction.receipt_image)
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground break-all">
                    Image URL: {selectedTransaction.receipt_image}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
