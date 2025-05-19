"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMonthlyReportData } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

const COLORS = ["#4ade80", "#60a5fa", "#f87171", "#facc15", "#a78bfa", "#fb923c", "#94a3b8", "#f472b6"]

export function MonthlyReport() {
  const [date, setDate] = useState(new Date())
  const [reportData, setReportData] = useState({
    income: [],
    expenses: [],
    dailyTransactions: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReportData() {
      try {
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // JavaScript months are 0-indexed

        const data = await getMonthlyReportData(year, month)
        setReportData(data)
      } catch (error) {
        console.error("Error loading report data:", error)
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
  }, [date])

  const totalIncome = reportData.income.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalExpenses = reportData.expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

  if (loading) {
    return <div className="py-10 text-center">Loading report data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold neon-text">{format(date, "MMMM yyyy")}</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus showMonthYearPicker />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-emerald-400 neon-text">${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Net Balance</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className={cn(
                "text-2xl font-bold",
                balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
              )}
            >
              ${balance.toFixed(2)} ({savingsRate}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="border border-[#2a2a3c] dark:bg-[#13131a]">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:dark:bg-[#1c1c2a] data-[state=active]:dark:text-neon-green"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="income"
            className="data-[state=active]:dark:bg-[#1c1c2a] data-[state=active]:dark:text-neon-green"
          >
            Income
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:dark:bg-[#1c1c2a] data-[state=active]:dark:text-neon-green"
          >
            Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Daily Transactions</CardTitle>
              <CardDescription>Income and expenses throughout the month</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.dailyTransactions.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No transaction data available for this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reportData.dailyTransactions}>
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value.toFixed(2)}`, ""]}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} name="Expenses" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
                <CardDescription>Sources of income for {format(date, "MMMM yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.income.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No income data available for this month.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.income}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                      >
                        {reportData.income.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Details</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.income.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No income data available for this month.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportData.income.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{item.category}</span>
                        </div>
                        <div className="font-medium">${Number(item.amount).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money went in {format(date, "MMMM yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.expenses.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expense data available for this month.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.expenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                      >
                        {reportData.expenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.expenses.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expense data available for this month.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportData.expenses.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{item.category}</span>
                        </div>
                        <div className="font-medium">${Number(item.amount).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
