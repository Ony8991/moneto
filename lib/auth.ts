import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function verifyToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is not configured')
    const decoded = jwt.verify(token, secret) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
}
