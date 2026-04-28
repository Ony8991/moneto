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

// GET — récupérer toutes les dépenses de l'utilisateur
export async function GET(request) {
  const userId = verifyToken(request)
  
  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  await connectDB()
  const expenses = await Expense.find({ userId }).sort({ date: -1 })
  return NextResponse.json(expenses)
}

// POST — créer une nouvelle dépense
export async function POST(request) {
  const userId = verifyToken(request)
  
  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  await connectDB()
  const body = await request.json()
  const expense = await Expense.create({ ...body, userId })
  return NextResponse.json(expense, { status: 201 })
}