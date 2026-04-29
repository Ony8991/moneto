import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { createExpenseSchema } from '@/lib/validators/expense.validator'
import { getUserExpenses, createExpense } from '@/lib/services/expense.service'

export async function GET(request: Request) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()
  const expenses = await getUserExpenses(userId)
  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()
  try {
    const body = await request.json()
    const input = createExpenseSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json(
        { message: input.error.issues[0].message },
        { status: 400 }
      )
    }
    const expense = await createExpense(userId, input.data)
    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
