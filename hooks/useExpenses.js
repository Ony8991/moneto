import { useAuth } from '@/context/AuthContext'

export function useExpenses() {
  const { token } = useAuth()

  const getExpenses = async () => {
    const res = await fetch('/api/expenses', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return await res.json()
  }

  const addExpense = async (amount, category, description) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount, category, description })
    })
    return await res.json()
  }

  const updateExpense = async (id, data) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return await res.json()
  }

  const deleteExpense = async (id) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    return await res.json()
  }

  return { getExpenses, addExpense, updateExpense, deleteExpense }
}
