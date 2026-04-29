import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validators/auth.validator'
import { loginUser } from '@/lib/services/auth.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = loginSchema.safeParse(body)

    if (!input.success) {
      return NextResponse.json(
        { message: input.error.issues[0].message },
        { status: 400 }
      )
    }

    const result = await loginUser(input.data)
    return NextResponse.json(
      { message: 'Login successful', ...result },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 401 }
    )
  }
}