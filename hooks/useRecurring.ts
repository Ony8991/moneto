'use client'

import { useState, useEffect, useCallback } from 'react'

export interface RecurringExpense {
  _id: string
  amount: number
  category: string
  description: string
  dayOfMonth: number
}

export function useRecurring() {
  const [items, setItems] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recurring')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const add = async (
    amount: number,
    category: string,
    description: string,
    dayOfMonth: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, description, dayOfMonth }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      await load()
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Error' }
    }
  }

  const remove = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Error' }
    }
  }

  return { items, loading, add, remove }
}
