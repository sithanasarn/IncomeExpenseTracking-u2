"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
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

export default function TransactionDetailPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTransaction() {
      try {
        setLoading(true)
        const response = await fetch(`/api/transactions/${id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
          throw new Error(errorMessage)
        }

        const data = await response.json()
        setTransaction(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching transaction:", error)
        setError(error.message)
        toast({
          title: "Error",
          description: `Failed to load transaction: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTransaction()
    }
  }, [id])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
        throw new Error(errorMessage)
      }

      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed.",
      })

      router.push("/transactions")
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const downloadReceipt = () => {
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-6 w-48 bg-foreground/10 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-foreground/10 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 w-full bg-foreground/10 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-foreground/10 rounded animate-pulse"></div>
              <div className="h-40 w-full bg-foreground/10 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="ml-2">Back</span>
        </Button>
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => router.push("/transactions")}>
              Return to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="ml-2">Back</span>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Transaction Not Found</CardTitle>
            <CardDescription>The requested transaction could not be found</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/transactions")}>Return to Transactions</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {transaction.receipt_image && (
            <Button variant="outline" onClick={downloadReceipt}>
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
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
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {transaction.type === "income" ? "Income" : "Expense"}: {transaction.description}
          </CardTitle>
          <CardDescription>
            {transaction.date ? new Date(transaction.date).toLocaleDateString() : "No date"} •{" "}
            {transaction.categories?.name || "Uncategorized"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span
                className={`text-xl font-bold ${transaction.type === "income" ? "text-emerald-400" : "text-red-400"}`}
              >
                {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount || 0).toFixed(2)}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p>{transaction.description}</p>
            </div>

            {transaction.receipt_image && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Receipt</h3>
                <div className="relative aspect-[4/3] w-full max-w-md mx-auto overflow-hidden rounded-md border border-[#2a2a3c]">
                  <Image
                    src={transaction.receipt_image || "/placeholder.svg"}
                    alt="Receipt"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
