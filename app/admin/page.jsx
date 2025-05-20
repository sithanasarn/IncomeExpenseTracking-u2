"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownIcon, ArrowUpIcon, Trash2, Eye, ImageIcon, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

export default function AdminPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    transactionsWithReceipts: 0,
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/transactions")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setTransactions(data)

      // Calculate stats
      const totalIncome = data.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount || 0), 0)

      const totalExpenses = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount || 0), 0)

      const transactionsWithReceipts = data.filter((t) => t.receipt_image).length

      setStats({
        totalTransactions: data.length,
        totalIncome,
        totalExpenses,
        transactionsWithReceipts,
      })

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

      // Update stats
      const deletedTransaction = transactions.find((t) => t.id === id)
      if (deletedTransaction) {
        setStats((prev) => ({
          ...prev,
          totalTransactions: prev.totalTransactions - 1,
          totalIncome:
            deletedTransaction.type === "income"
              ? prev.totalIncome - Number(deletedTransaction.amount || 0)
              : prev.totalIncome,
          totalExpenses:
            deletedTransaction.type === "expense"
              ? prev.totalExpenses - Number(deletedTransaction.amount || 0)
              : prev.totalExpenses,
          transactionsWithReceipts: deletedTransaction.receipt_image
            ? prev.transactionsWithReceipts - 1
            : prev.transactionsWithReceipts,
        }))
      }

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

  const downloadReceipt = (transaction) => {
    if (!transaction?.receipt_image) return

    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = transaction.receipt_image
    link.download = `receipt-${transaction.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-foreground/10 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-foreground/10 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full bg-foreground/10 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white neon-text">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-emerald-400 neon-text">${stats.totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-red-400 neon-text">${stats.totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Receipts</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white neon-text">{stats.transactionsWithReceipts}</div>
            <p className="text-xs text-muted-foreground">Transactions with receipts</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Manage all financial transactions</CardDescription>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-4">
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
                <SelectItem value="with-receipt">With Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-500 hover:text-emerald-400"
                              onClick={() => viewTransactionDetails(transaction)}
                            >
                              <ImageIcon className="h-4 w-4" />
                              <span className="sr-only">View Receipt</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-500 hover:text-blue-400"
                              onClick={() => downloadReceipt(transaction)}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download Receipt</span>
                            </Button>
                          </div>
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
                            onClick={() => router.push(`/transactions/${transaction.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the transaction.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Image</DialogTitle>
          </DialogHeader>
          {selectedTransaction?.receipt_image && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[#2a2a3c]">
                <Image
                  src={selectedTransaction.receipt_image || "/placeholder.svg"}
                  alt="Receipt"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => downloadReceipt(selectedTransaction)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
