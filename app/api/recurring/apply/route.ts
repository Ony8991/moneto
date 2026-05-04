import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { applyRecurringExpenses } from '@/lib/services/recurring.service'

export async function POST() {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  const result = await applyRecurringExpenses(userId)
  return NextResponse.json(result)
}
