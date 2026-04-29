import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function verifyToken(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.userId
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}