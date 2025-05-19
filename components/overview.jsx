"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { toast } from "@/components/ui/use-toast"
import { ErrorFallback } from "@/components/error-fallback"

export function Overview() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("Fetching overview data...")

      // Get current year
      const currentYear = new Date().getFullYear()

      // Create an array of months
      const months = Array.from({ length: 12 }, (_, i) => {
        return {
          name: new Date(currentYear, i, 1).toLocaleString("default", { month: "short" }),
          income: 0,
          expenses: 0,
        }
      })

      // Fetch all transactions
      const response = await fetch("/api/transactions")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
        throw new Error(errorMessage)
      }

      const transactions = await response.json()
      console.log(`Fetched ${transactions.length} transactions for overview`)

      // Process transactions into monthly data
      transactions.forEach((transaction) => {
        const date = new Date(transaction.date)
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth()
          const amount = Number(transaction.amount || 0)

          if (transaction.type === "income") {
            months[monthIndex].income += amount
          } else {
            months[monthIndex].expenses += amount
          }
        }
      })

      setData(months)
      setError(null)
    } catch (error) {
      console.error("Error fetching overview data:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to load overview data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[350px] flex items-center justify-center">Loading chart data...</div>
  }

  if (error) {
    return <ErrorFallback title="Chart Error" description="Failed to load overview data." retry={fetchData} />
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, ""]} labelFormatter={(label) => `Month: ${label}`} />
        <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} name="Income" stroke="#4ade80" strokeWidth={1} />
        <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} name="Expenses" stroke="#f87171" strokeWidth={1} />
      </BarChart>
    </ResponsiveContainer>
  )
}
