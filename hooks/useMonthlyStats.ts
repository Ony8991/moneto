'use client'

import { useState, useEffect } from 'react'

export interface MonthlyEntry {
  month: string // "YYYY-MM"
  total: number // in EUR
}

export function useMonthlyStats() {
  const [data, setData] = useState<MonthlyEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/expenses/monthly')
      .then(res => (res.ok ? res.json() : []))
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
