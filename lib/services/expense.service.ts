import { connectDB } from '@/lib/mongodb'
import Expense from '@/models/Expense'
import { CreateExpenseInput, UpdateExpenseInput } from '@/lib/validators/expense.validator'

interface ExpenseFilters {
  category?: string
  month?: string // "YYYY-MM"
}

export async function getUserExpenses(userId: string, filters: ExpenseFilters = {}) {
  await connectDB()
  const query: Record<string, unknown> = { userId }

  if (filters.category) query.category = filters.category

  if (filters.month) {
    const [year, month] = filters.month.split('-').map(Number)
    query.date = {
      $gte: new Date(year, month - 1, 1),
      $lt: new Date(year, month, 1),
    }
  }

  return Expense.find(query).sort({ date: -1 })
}

export async function createExpense(userId: string, input: CreateExpenseInput) {
  await connectDB()
  return Expense.create({
    ...input,
    userId,
    date: input.date ? new Date(input.date) : new Date(),
  })
}

export async function deleteExpense(userId: string, expenseId: string) {
  await connectDB()
  const expense = await Expense.findById(expenseId)
  if (!expense) throw new Error('Expense not found')
  if (expense.userId.toString() !== userId) throw new Error('Forbidden')
  await Expense.findByIdAndDelete(expenseId)
  return { message: 'Expense deleted' }
}

export async function updateExpense(userId: string, expenseId: string, input: UpdateExpenseInput) {
  await connectDB()
  const expense = await Expense.findById(expenseId)
  if (!expense) throw new Error('Expense not found')
  if (expense.userId.toString() !== userId) throw new Error('Forbidden')
  const updateData = { ...input, ...(input.date ? { date: new Date(input.date) } : {}) }
  return Expense.findByIdAndUpdate(expenseId, updateData, { new: true })
}
