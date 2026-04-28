import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function verifyAuth(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    
    if (!token) {
      return { error: 'No token provided', status: 401 }
    }

    const verified = await jwtVerify(token, SECRET)
    return { userId: verified.payload.userId, error: null }
  } catch (err) {
    return { error: 'Invalid token', status: 401 }
  }
}

export function createAuthResponse(status, message, data = null) {
  return NextResponse.json(
    { message, ...(data && { data }) },
    { status }
  )
}
