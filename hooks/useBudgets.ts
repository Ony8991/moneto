'use client'

import { useState, useEffect } from 'react'

export function useBudgets() {
  const [budgets, setBudgets] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/budgets')
      .then(res => (res.ok ? res.json() : { categories: {} }))
      .then(data => setBudgets(data.categories ?? {}))
      .catch(() => setBudgets({}))
      .finally(() => setLoading(false))
  }, [])

  const saveBudgets = async (newBudgets: Record<string, number>): Promise<boolean> => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: newBudgets }),
      })
      if (res.ok) setBudgets(newBudgets)
      return res.ok
    } catch {
      return false
    }
  }

  return { budgets, loading, saveBudgets }
}
