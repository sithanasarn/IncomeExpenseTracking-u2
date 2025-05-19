"use client"

import { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Sector,
} from "recharts"
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

// Custom tooltip component with improved styling
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="custom-tooltip bg-[#1c1c2a] border border-[#2a2a3c] p-3 rounded-md shadow-lg">
        <p className="font-medium text-white">{data.category || data.name}</p>
        <p className="text-emerald-400">${Number(data.amount || data.value).toFixed(2)}</p>
        {data.percent && <p className="text-gray-300">{data.percent.toFixed(1)}%</p>}
      </div>
    )
  }
  return null
}

// Custom label for pie chart segments
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  // Only show label if segment is large enough (more than 5%)
  if (percent < 0.05) return null

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// Custom active shape for the pie chart
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
        strokeWidth={2}
      />
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#fff" className="text-sm">
        {payload.category}
      </text>
      <text x={cx} y={cy} textAnchor="middle" fill="#fff" className="text-base font-medium">
        ${Number(value).toFixed(2)}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#4ade80" className="text-sm">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  )
}

export function MonthlyReport() {
  const [date, setDate] = useState(new Date())
  const [reportData, setReportData] = useState({
    income: [],
    expenses: [],
    dailyTransactions: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeIncomeIndex, setActiveIncomeIndex] = useState(0)
  const [activeExpenseIndex, setActiveExpenseIndex] = useState(0)

  useEffect(() => {
    async function loadReportData() {
      try {
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // JavaScript months are 0-indexed

        const data = await getMonthlyReportData(year, month)

        // Calculate percentages for pie charts
        const totalIncome = data.income.reduce((sum, item) => sum + Number(item.amount), 0)
        const totalExpenses = data.expenses.reduce((sum, item) => sum + Number(item.amount), 0)

        // Add percent property to each item
        data.income = data.income.map((item) => ({
          ...item,
          percent: totalIncome > 0 ? Number(item.amount) / totalIncome : 0,
        }))

        data.expenses = data.expenses.map((item) => ({
          ...item,
          percent: totalExpenses > 0 ? Number(item.amount) / totalExpenses : 0,
        }))

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

  const onIncomeEnter = (_, index) => {
    setActiveIncomeIndex(index)
  }

  const onExpenseEnter = (_, index) => {
    setActiveExpenseIndex(index)
  }

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
                      content={<CustomTooltip />}
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
                        activeIndex={activeIncomeIndex}
                        activeShape={renderActiveShape}
                        data={reportData.income}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                        onMouseEnter={onIncomeEnter}
                      >
                        {reportData.income.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
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
                        <div className="font-medium">
                          ${Number(item.amount).toFixed(2)} ({(item.percent * 100).toFixed(1)}%)
                        </div>
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
                        activeIndex={activeExpenseIndex}
                        activeShape={renderActiveShape}
                        data={reportData.expenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                        onMouseEnter={onExpenseEnter}
                      >
                        {reportData.expenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
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
                        <div className="font-medium">
                          ${Number(item.amount).toFixed(2)} ({(item.percent * 100).toFixed(1)}%)
                        </div>
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
