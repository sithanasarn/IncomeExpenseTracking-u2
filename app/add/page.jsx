import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTransactionForm } from "@/components/add-transaction-form"

export default function AddTransactionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
          <CardDescription>Record a new income or expense transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <AddTransactionForm />
        </CardContent>
      </Card>
    </div>
  )
}
