import { connectDB } from '@/lib/mongodb'
import Expense from '@/models/Expense'
import { verifyToken, unauthorized } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  await connectDB()
  const expense = await Expense.findById(params.id)

  if (!expense) {
    return NextResponse.json({ message: 'Expense not found' }, { status: 404 })
  }

  if (expense.userId.toString() !== userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await Expense.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Depense supprimee' })
}

export async function PUT(request, { params }) {
  const userId = verifyToken(request)
  if (!userId) return unauthorized()

  await connectDB()
  const expense = await Expense.findById(params.id)

  if (!expense) {
    return NextResponse.json({ message: 'Expense not found' }, { status: 404 })
  }

  if (expense.userId.toString() !== userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const updated = await Expense.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(updated)
}