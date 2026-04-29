import { connectDB } from '@/lib/mongodb'
import Expense from '@/models/Expense'
import { verifyToken, unauthorized } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  await connectDB()
  const expenses = await Expense.find({ userId }).sort({ date: -1 })
  return NextResponse.json(expenses)
}

export async function POST(request) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  await connectDB()
  const body = await request.json()
  const expense = await Expense.create({ ...body, userId })
  return NextResponse.json(expense, { status: 201 })
}