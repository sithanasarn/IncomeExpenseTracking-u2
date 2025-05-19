"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export function DashboardCards() {
  const [dashboardData, setDashboardData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    savingsRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        console.log("Fetching dashboard data...")
        const response = await fetch("/api/dashboard")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("Dashboard data received:", data)
        setDashboardData(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error.message)
        toast({
          title: "Error",
          description: `Failed to load dashboard data: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // If there's an error but we're not loading anymore, show fallback data
  if (error && !loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white neon-text">$0.00</div>
            <p className="text-xs text-red-400">Error loading data</p>
          </CardContent>
        </Card>
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white neon-text">$0.00</div>
            <p className="text-xs text-red-400">Error loading data</p>
          </CardContent>
        </Card>
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white neon-text">$0.00</div>
            <p className="text-xs text-red-400">Error loading data</p>
          </CardContent>
        </Card>
        <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground/80">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white neon-text">0%</div>
            <p className="text-xs text-red-400">Error loading data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/80">Loading...</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="h-6 w-24 bg-foreground/10 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { income, expenses, balance, savingsRate } = dashboardData

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-foreground/80">Total Balance</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-white neon-text">${balance.toFixed(2)}</div>
          <p className="text-xs text-emerald-400">Current month balance</p>
        </CardContent>
      </Card>
      <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-foreground/80">Monthly Income</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-white neon-text">${income.toFixed(2)}</div>
          <p className="text-xs text-emerald-400">Current month income</p>
        </CardContent>
      </Card>
      <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-foreground/80">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-white neon-text">${expenses.toFixed(2)}</div>
          <p className="text-xs text-emerald-400">Current month expenses</p>
        </CardContent>
      </Card>
      <Card className="border border-[#2a2a3c] dark:bg-[#13131a] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#1c1c2a] z-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-foreground/80">Savings Rate</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-white neon-text">{savingsRate}%</div>
          <p className="text-xs text-emerald-400">Current month savings rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
