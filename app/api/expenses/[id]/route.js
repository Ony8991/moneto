import { connectDB } from '@/lib/mongodb'
import Expense from '@/models/Expense'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function verifyToken(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return null
    
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.userId
  } catch {
    return null
  }
}

// DELETE — supprimer une dépense
export async function DELETE(request, { params }) {
  const userId = verifyToken(request)
  
  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  await connectDB()
  const expense = await Expense.findById(params.id)
  
  if (!expense) {
    return NextResponse.json(
      { message: 'Expense not found' },
      { status: 404 }
    )
  }

  if (expense.userId.toString() !== userId) {
    return NextResponse.json(
      { message: 'Forbidden' },
      { status: 403 }
    )
  }

  await Expense.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Dépense supprimée' })
}

// PUT — modifier une dépense
export async function PUT(request, { params }) {
  const userId = verifyToken(request)
  
  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  await connectDB()
  const expense = await Expense.findById(params.id)
  
  if (!expense) {
    return NextResponse.json(
      { message: 'Expense not found' },
      { status: 404 }
    )
  }

  if (expense.userId.toString() !== userId) {
    return NextResponse.json(
      { message: 'Forbidden' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const updatedExpense = await Expense.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(updatedExpense)
}