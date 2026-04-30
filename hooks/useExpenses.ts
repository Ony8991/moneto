'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Expense, ExpenseFilters } from '@/types/expense'

export function useExpenses(filters: ExpenseFilters = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.month) params.set('month', filters.month)
      const res = await fetch(`/api/expenses?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setExpenses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [filters.category, filters.month])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const addExpense = async (
    amount: number,
    category: string,
    description: string,
    date?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (amount <= 0) return { success: false, error: 'Le montant doit être supérieur à 0' }
    if (!description?.trim()) return { success: false, error: 'La description ne peut pas être vide' }
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, description, date }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      await loadExpenses()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de l'ajout" }
    }
  }

  const updateExpense = async (
    id: string,
    data: Partial<Expense>
  ): Promise<{ success: boolean; error?: string }> => {
    if (data.amount !== undefined && data.amount <= 0)
      return { success: false, error: 'Le montant doit être supérieur à 0' }
    if (data.description !== undefined && !data.description?.trim())
      return { success: false, error: 'La description ne peut pas être vide' }
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      await loadExpenses()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la modification' }
    }
  }

  const deleteExpense = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      await loadExpenses()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la suppression' }
    }
  }

  return { expenses, loading, total, addExpense, updateExpense, deleteExpense }
}
