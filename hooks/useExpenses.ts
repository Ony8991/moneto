import { useAuth } from '@/context/AuthContext'

interface Expense {
  _id: string
  amount: number
  category: string
  description: string
  date: string
  userId: string
}

interface ApiError {
  error?: string
  message?: string
}

export function useExpenses() {
  const { token } = useAuth()

  const getExpenses = async (): Promise<Expense[]> => {
    try {
      const res = await fetch('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return []
    }
  }

  const addExpense = async (
    amount: number,
    category: string,
    description: string
  ): Promise<{ success: boolean; data?: Expense; error?: string }> => {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Le montant doit être supérieur à 0' }
      }
      if (!description?.trim()) {
        return { success: false, error: 'La description ne peut pas être vide' }
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, category, description })
      })

      if (!res.ok) {
        const error: ApiError = await res.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${res.status}`)
      }

      const data: Expense = await res.json()
      return { success: true, data }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'ajout'
      console.error('Error adding expense:', error)
      return { success: false, error: message }
    }
  }

  const updateExpense = async (
    id: string,
    data: Partial<Expense>
  ): Promise<{ success: boolean; data?: Expense; error?: string }> => {
    try {
      if (data.amount !== undefined && data.amount <= 0) {
        return { success: false, error: 'Le montant doit être supérieur à 0' }
      }
      if (data.description !== undefined && !data.description?.trim()) {
        return { success: false, error: 'La description ne peut pas être vide' }
      }

      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const error: ApiError = await res.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${res.status}`)
      }

      const result: Expense = await res.json()
      return { success: true, data: result }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la modification'
      console.error('Error updating expense:', error)
      return { success: false, error: message }
    }
  }

  const deleteExpense = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        const error: ApiError = await res.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${res.status}`)
      }

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
      console.error('Error deleting expense:', error)
      return { success: false, error: message }
    }
  }

  return { getExpenses, addExpense, updateExpense, deleteExpense }
}
