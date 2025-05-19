"use client"

import { useState, useEffect } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"
import { toast } from "@/components/ui/use-toast"

const COLORS = ["#4ade80", "#60a5fa", "#f87171", "#facc15", "#a78bfa", "#fb923c", "#94a3b8", "#f472b6"]

export function MonthlyStats() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMonthlyStats() {
      try {
        // Get current month
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const firstDay = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]
        const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0]

        // Fetch all transactions
        const response = await fetch("/api/transactions")
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }

        const transactions = await response.json()

        // Filter transactions for current month and expenses only
        const monthlyExpenses = transactions.filter((transaction) => {
          const date = new Date(transaction.date)
          return date >= new Date(firstDay) && date <= new Date(lastDay) && transaction.type === "expense"
        })

        // Group by category
        const expensesByCategory = {}
        monthlyExpenses.forEach((transaction) => {
          const category = transaction.categories?.name || "Other"
          if (!expensesByCategory[category]) {
            expensesByCategory[category] = 0
          }
          expensesByCategory[category] += Number(transaction.amount)
        })

        // Convert to array for chart
        const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
          name,
          value,
        }))

        setData(chartData)
      } catch (error) {
        console.error("Error fetching monthly stats:", error)
        toast({
          title: "Error",
          description: "Failed to load monthly statistics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyStats()
  }, [])

  if (loading) {
    return <div className="h-[350px] flex items-center justify-center">Loading monthly stats...</div>
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-xl font-semibold mb-4 neon-text">
          {new Date().toLocaleString("default", { month: "long", year: "numeric" })} Expenses
        </div>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          No expense data available for this month.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-semibold mb-4 neon-text">
        {new Date().toLocaleString("default", { month: "long", year: "numeric" })} Expenses
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`$${value.toFixed(2)}`, ""]}
            contentStyle={{
              backgroundColor: "#13131a",
              borderColor: "#2a2a3c",
              borderRadius: "0.375rem",
              boxShadow: "0 0 10px rgba(74, 222, 128, 0.2)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
