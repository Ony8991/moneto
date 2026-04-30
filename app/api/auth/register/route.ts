import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validators/auth.validator'
import { registerUser } from '@/lib/services/auth.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = registerSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ message: input.error.issues[0].message }, { status: 400 })
    }
    const result = await registerUser(input.data)
    const response = NextResponse.json({ message: 'Compte créé avec succès', user: result.user }, { status: 201 })
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    const status = message.includes('existe') ? 409 : 500
    return NextResponse.json({ message }, { status })
  }
}
