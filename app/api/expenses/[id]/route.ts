import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { updateExpenseSchema } from '@/lib/validators/expense.validator'
import { deleteExpense, updateExpense } from '@/lib/services/expense.service'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  try {
    const result = await deleteExpense(userId, params.id)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  try {
    const body = await request.json()
    const input = updateExpenseSchema.safeParse(body)

    if (!input.success) {
      return NextResponse.json(
        { message: input.error.issues[0].message },
        { status: 400 }
      )
    }

    const expense = await updateExpense(userId, params.id, input.data)
    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
