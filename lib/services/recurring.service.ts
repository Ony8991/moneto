import { connectDB } from '@/lib/mongodb'
import RecurringExpense from '@/models/RecurringExpense'
import Expense from '@/models/Expense'
import { CreateRecurringInput } from '@/lib/validators/recurring.validator'

export async function getRecurringExpenses(userId: string) {
  await connectDB()
  return RecurringExpense.find({ userId }).sort({ dayOfMonth: 1 })
}

export async function createRecurringExpense(userId: string, input: CreateRecurringInput) {
  await connectDB()
  return RecurringExpense.create({ ...input, userId })
}

export async function deleteRecurringExpense(userId: string, id: string) {
  await connectDB()
  const item = await RecurringExpense.findById(id)
  if (!item) throw new Error('Recurring expense not found')
  if (item.userId.toString() !== userId) throw new Error('Forbidden')
  await RecurringExpense.findByIdAndDelete(id)
}

export async function applyRecurringExpenses(userId: string) {
  await connectDB()
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const templates = await RecurringExpense.find({ userId })
  const created: string[] = []

  for (const t of templates) {
    const exists = await Expense.findOne({ recurringId: t._id, generatedMonth: month })
    if (exists) continue

    const day = Math.min(t.dayOfMonth, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
    const date = new Date(now.getFullYear(), now.getMonth(), day)

    await Expense.create({
      userId,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date,
      recurringId: t._id,
      generatedMonth: month,
    })
    created.push(t._id.toString())
  }

  return { created: created.length }
}
