import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { createRecurringSchema } from '@/lib/validators/recurring.validator'
import { getRecurringExpenses, createRecurringExpense } from '@/lib/services/recurring.service'

export async function GET() {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  const items = await getRecurringExpenses(userId)
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  try {
    const body = await request.json()
    const input = createRecurringSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ message: input.error.issues[0].message }, { status: 400 })
    }
    const item = await createRecurringExpense(userId, input.data)
    return NextResponse.json(item, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
