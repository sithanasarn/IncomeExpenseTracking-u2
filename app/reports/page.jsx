import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyReport } from "@/components/monthly-report"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Reports</CardTitle>
          <CardDescription>Detailed breakdown of your finances by month</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyReport />
        </CardContent>
      </Card>
    </div>
  )
}
