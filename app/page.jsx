"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { MonthlyStats } from "@/components/monthly-stats"
import { DashboardCards } from "@/components/dashboard-cards"
import { DatabaseError } from "@/components/database-error"

export default function DashboardPage() {
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {
    // Check if we can connect to the database
    async function checkConnection() {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) {
          setConnectionError(true)
        } else {
          setConnectionError(false)
        }
      } catch (error) {
        console.error("Connection check error:", error)
        setConnectionError(true)
      }
    }

    checkConnection()
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  if (connectionError) {
    return <DatabaseError onRetry={handleRetry} />
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <DashboardCards />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="border border-[#2a2a3c] dark:bg-[#13131a]">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:dark:bg-[#1c1c2a] data-[state=active]:dark:text-neon-green"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="data-[state=active]:dark:bg-[#1c1c2a] data-[state=active]:dark:text-neon-green"
          >
            Monthly
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4 border border-[#2a2a3c] dark:bg-[#13131a]">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>View your income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="md:col-span-3 border border-[#2a2a3c] dark:bg-[#13131a]">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card className="border border-[#2a2a3c] dark:bg-[#13131a]">
            <CardHeader>
              <CardTitle>Monthly Statistics</CardTitle>
              <CardDescription>Your financial breakdown by month</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <MonthlyStats />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
