import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Budget from '@/models/Budget'

export async function GET() {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  await connectDB()
  const budget = await Budget.findOne({ userId })
  return NextResponse.json({ categories: budget?.categories ?? {} })
}

export async function PUT(request: Request) {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  try {
    const { categories } = await request.json()
    await connectDB()
    await Budget.findOneAndUpdate(
      { userId },
      { categories },
      { upsert: true, new: true }
    )
    return NextResponse.json({ categories })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ message }, { status: 500 })
  }
}
