import { getSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available. Check your environment configuration." },
        { status: 503 },
      )
    }

    // Get current month's first and last day
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

    console.log(`Fetching transactions between ${firstDay} and ${lastDay}`)

    // Get monthly income
    const { data: incomeData, error: incomeError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "income")
      .gte("date", firstDay)
      .lte("date", lastDay)

    if (incomeError) {
      console.error("Error fetching income data:", incomeError)
      return NextResponse.json({ error: `Income data error: ${incomeError.message}` }, { status: 500 })
    }

    // Get monthly expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "expense")
      .gte("date", firstDay)
      .lte("date", lastDay)

    if (expenseError) {
      console.error("Error fetching expense data:", expenseError)
      return NextResponse.json({ error: `Expense data error: ${expenseError.message}` }, { status: 500 })
    }

    // Calculate totals
    const totalIncome = incomeData ? incomeData.reduce((sum, item) => sum + Number(item.amount), 0) : 0
    const totalExpenses = expenseData ? expenseData.reduce((sum, item) => sum + Number(item.amount), 0) : 0
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

    return NextResponse.json({
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      savingsRate,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
