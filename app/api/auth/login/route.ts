import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validators/auth.validator'
import { loginUser } from '@/lib/services/auth.service'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const input = loginSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ message: input.error.issues[0].message }, { status: 400 })
    }
    const result = await loginUser(input.data)
    const response = NextResponse.json({ message: 'Connexion réussie', user: result.user }, { status: 200 })
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
    return NextResponse.json({ message }, { status: 401 })
  }
}
