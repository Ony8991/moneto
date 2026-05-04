import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { deleteRecurringExpense } from '@/lib/services/recurring.service'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  try {
    const { id } = await params
    await deleteRecurringExpense(userId, id)
    return NextResponse.json({ message: 'Deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status = message === 'Forbidden' ? 403 : 404
    return NextResponse.json({ message }, { status })
  }
}
