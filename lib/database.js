import { supabase } from "./supabase"

// Categories
export async function getCategories() {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      throw new Error(`Categories error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Get categories error:", error)
    throw error
  }
}

// Transactions
export async function getTransactions() {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      throw new Error(`Transactions error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Get transactions error:", error)
    throw error
  }
}

export async function addTransaction(transaction) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          category_id: transaction.category_id,
          date: transaction.date,
        },
      ])
      .select()

    if (error) {
      console.error("Error adding transaction:", error)
      throw new Error(`Add transaction error: ${error.message}`)
    }

    return data[0]
  } catch (error) {
    console.error("Add transaction error:", error)
    throw error
  }
}

export async function deleteTransaction(id) {
  try {
    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting transaction:", error)
      throw new Error(`Delete transaction error: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Delete transaction error:", error)
    throw error
  }
}

// Dashboard data
export async function getDashboardData() {
  try {
    // Get current month's first and last day
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

    // Get monthly income
    const { data: incomeData, error: incomeError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "income")
      .gte("date", firstDay)
      .lte("date", lastDay)

    if (incomeError) {
      console.error("Error fetching income data:", incomeError)
      throw new Error(`Income data error: ${incomeError.message}`)
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
      throw new Error(`Expense data error: ${expenseError.message}`)
    }

    const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0)
    const totalExpenses = expenseData.reduce((sum, item) => sum + Number(item.amount), 0)
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      savingsRate,
    }
  } catch (error) {
    console.error("Dashboard data error:", error)
    throw error
  }
}

// Monthly report data
export async function getMonthlyReportData(year, month) {
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

  data.forEach((transaction) => {
    const category = transaction.categories?.name || "Other"
    const amount = Number(transaction.amount)
    const day = new Date(transaction.date).getDate().toString()

    // Group by category
    if (transaction.type === "income") {
      incomeByCategory[category] = (incomeByCategory[category] || 0) + amount
    } else {
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
}

// Get overview data for charts
export async function getOverviewData() {
  const now = new Date()
  const currentYear = now.getFullYear()

  // Get monthly data for the current year
  const monthlyData = []

  for (let month = 0; month < 12; month++) {
    const firstDay = new Date(currentYear, month, 1).toISOString().split("T")[0]
    const lastDay = new Date(currentYear, month + 1, 0).toISOString().split("T")[0]

    // Get monthly income
    const { data: incomeData, error: incomeError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "income")
      .gte("date", firstDay)
      .lte("date", lastDay)

    // Get monthly expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "expense")
      .gte("date", firstDay)
      .lte("date", lastDay)

    if (incomeError || expenseError) {
      console.error("Error fetching overview data:", incomeError || expenseError)
      continue
    }

    const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0)
    const totalExpenses = expenseData.reduce((sum, item) => sum + Number(item.amount), 0)

    monthlyData.push({
      name: new Date(currentYear, month, 1).toLocaleString("default", { month: "short" }),
      income: totalIncome,
      expenses: totalExpenses,
    })
  }

  return monthlyData
}
