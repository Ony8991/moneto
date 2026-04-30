export interface Expense {
  _id: string
  amount: number
  category: string
  description: string
  date: string
  userId: string
}

export interface ExpenseFilters {
  category?: string
  month?: string // "YYYY-MM"
}
