import { connectDB } from '@/lib/mongodb'
import Expense from '@/models/Expense'
import { CreateExpenseInput, UpdateExpenseInput } from '@/lib/validators/expense.validator'

export async function getUserExpenses(userId: string) {
  await connectDB()
  return Expense.find({ userId }).sort({ date: -1 })
}

export async function createExpense(userId: string, input: CreateExpenseInput) {
  await connectDB()
  return Expense.create({ ...input, userId })
}

export async function deleteExpense(userId: string, expenseId: string) {
  await connectDB()
  const expense = await Expense.findById(expenseId)
  if (!expense) throw new Error('Depense introuvable')
  if (expense.userId.toString() !== userId) throw new Error('Forbidden')
  await Expense.findByIdAndDelete(expenseId)
  return { message: 'Depense supprimee' }
}

export async function updateExpense(userId: string, expenseId: string, input: UpdateExpenseInput) {
  await connectDB()
  const expense = await Expense.findById(expenseId)
  if (!expense) throw new Error('Depense introuvable')
  if (expense.userId.toString() !== userId) throw new Error('Forbidden')
  return Expense.findByIdAndUpdate(expenseId, input, { new: true })
}
