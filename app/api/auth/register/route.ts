import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validators/auth.validator'
import { registerUser } from '@/lib/services/auth.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = registerSchema.safeParse(body)

    if (!input.success) {
      return NextResponse.json(
        { message: input.error.issues[0].message },
        { status: 400 }
      )
    }

    const result = await registerUser(input.data)
    return NextResponse.json(
      { message: 'User registered successfully', ...result },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: error.message?.includes('existe') ? 409 : 500 }
    )
  }
}