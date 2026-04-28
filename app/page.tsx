'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { token, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (token) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [token, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Moneto</h1>
        <p className="text-blue-100">Chargement...</p>
      </div>
    </div>
  )
}
