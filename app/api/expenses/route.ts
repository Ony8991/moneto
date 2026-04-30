import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { createExpenseSchema } from '@/lib/validators/expense.validator'
import { getUserExpenses, createExpense } from '@/lib/services/expense.service'

export async function GET(request: Request) {
  const userId = await verifyToken()
  if (!userId) return unauthorized()

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const month = searchParams.get('month') || undefined

  const expenses = await getUserExpenses(userId, { category, month })
  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  try {
    const body = await request.json()
    const input = createExpenseSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ message: input.error.issues[0].message }, { status: 400 })
    }
    const expense = await createExpense(userId, input.data)
    return NextResponse.json(expense, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ message }, { status: 500 })
  }
}
