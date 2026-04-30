import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { RegisterInput, LoginInput } from '@/lib/validators/auth.validator'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is required')
  return secret
}

export async function registerUser(input: RegisterInput) {
  await connectDB()
  const existing = await User.findOne({ email: input.email })
  if (existing) throw new Error('Un compte existe déjà avec cet email')
  const user = await User.create({ name: input.name, email: input.email, password: input.password })
  const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' })
  return { token, user: { id: user._id, name: user.name, email: user.email } }
}

export async function loginUser(input: LoginInput) {
  await connectDB()
  const user = await User.findOne({ email: input.email })
  if (!user) throw new Error('Email ou mot de passe incorrect')
  const isValid = await user.comparePassword(input.password)
  if (!isValid) throw new Error('Email ou mot de passe incorrect')
  const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' })
  return { token, user: { id: user._id, name: user.name, email: user.email } }
}
