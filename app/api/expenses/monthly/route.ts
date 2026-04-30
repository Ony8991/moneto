import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/models/Expense'
import mongoose from 'mongoose'

export async function GET() {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  await connectDB()

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const data = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  const result = data.map(({ _id, total }) => ({
    month: `${_id.year}-${String(_id.month).padStart(2, '0')}`,
    total,
  }))

  return NextResponse.json(result)
}
