"use client"

import { useState, useEffect } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip, Sector } from "recharts"
import { toast } from "@/components/ui/use-toast"

const COLORS = ["#4ade80", "#60a5fa", "#f87171", "#facc15", "#a78bfa", "#fb923c", "#94a3b8", "#f472b6"]

// Custom tooltip component with improved styling
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="custom-tooltip bg-[#1c1c2a] border border-[#2a2a3c] p-3 rounded-md shadow-lg">
        <p className="font-medium text-white">{data.name}</p>
        <p className="text-emerald-400">${Number(data.value).toFixed(2)}</p>
        <p className="text-gray-300">{data.percent.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

// Custom active shape for the pie chart that shows percentage
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
        {payload.name}
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

// Custom label for pie chart segments
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
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

export function MonthlyStats() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

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
        let totalExpenses = 0

        monthlyExpenses.forEach((transaction) => {
          const category = transaction.categories?.name || "Other"
          const amount = Number(transaction.amount)
          totalExpenses += amount

          if (!expensesByCategory[category]) {
            expensesByCategory[category] = 0
          }
          expensesByCategory[category] += amount
        })

        // Convert to array for chart and calculate percentages
        const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
          name,
          value,
          percent: totalExpenses > 0 ? value / totalExpenses : 0,
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

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

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
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={1}
            onMouseEnter={onPieEnter}
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
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value, entry, index) => <span className="text-sm text-gray-300">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
