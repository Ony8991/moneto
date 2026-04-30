import { NextResponse } from 'next/server'
import { verifyToken, unauthorized } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  const userId = await verifyToken()
  if (!userId) return unauthorized()
  await connectDB()
  const user = await User.findById(userId).select('-password')
  if (!user) return unauthorized()
  return NextResponse.json({ id: user._id, name: user.name, email: user.email })
}
