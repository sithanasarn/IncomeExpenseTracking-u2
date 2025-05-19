import { supabase } from "./supabaseClient" // Declare the supabase variable

// Monthly report data
export async function getMonthlyReportData(year, month) {
  try {
    // Get month's first and last day
    const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0]
    const lastDay = new Date(year, month, 0).toISOString().split("T")[0]

    // Get all transactions for the month
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories (
          name
        )
      `)
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date")

    if (error) {
      console.error("Error fetching monthly report data:", error)
      return {
        income: [],
        expenses: [],
        dailyTransactions: [],
      }
    }

    // Process data
    const incomeByCategory = {}
    const expensesByCategory = {}
    const dailyTransactions = {}
    let totalIncome = 0
    let totalExpenses = 0

    data.forEach((transaction) => {
      const category = transaction.categories?.name || "Other"
      const amount = Number(transaction.amount)
      const day = new Date(transaction.date).getDate().toString()

      // Group by category
      if (transaction.type === "income") {
        totalIncome += amount
        incomeByCategory[category] = (incomeByCategory[category] || 0) + amount
      } else {
        totalExpenses += amount
        expensesByCategory[category] = (expensesByCategory[category] || 0) + amount
      }

      // Group by day
      if (!dailyTransactions[day]) {
        dailyTransactions[day] = { day, income: 0, expenses: 0 }
      }

      if (transaction.type === "income") {
        dailyTransactions[day].income += amount
      } else {
        dailyTransactions[day].expenses += amount
      }
    })

    // Convert to arrays for charts
    const incomeData = Object.entries(incomeByCategory).map(([category, amount]) => ({
      category,
      amount,
    }))

    const expensesData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
    }))

    const dailyData = Object.values(dailyTransactions)

    return {
      income: incomeData,
      expenses: expensesData,
      dailyTransactions: dailyData,
    }
  } catch (error) {
    console.error("Error in getMonthlyReportData:", error)
    return {
      income: [],
      expenses: [],
      dailyTransactions: [],
    }
  }
}
