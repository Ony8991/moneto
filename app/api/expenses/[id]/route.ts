import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { updateExpenseSchema } from '@/lib/validators/expense.validator'
import { deleteExpense, updateExpense } from '@/lib/services/expense.service'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  try {
    const { id } = await params
    const result = await deleteExpense(userId, id)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  try {
    const { id } = await params
    const body = await request.json()
    const input = updateExpenseSchema.safeParse(body)

    if (!input.success) {
      return NextResponse.json(
        { message: input.error.issues[0].message },
        { status: 400 }
      )
    }

    const expense = await updateExpense(userId, id, input.data)
    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    )
  }
}
