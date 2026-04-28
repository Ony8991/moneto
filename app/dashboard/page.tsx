'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useExpenses } from '@/hooks/useExpenses'
import AddExpenseForm from '@/components/AddExpenseForm'
import ExpenseList from '@/components/ExpenseList'

export default function DashboardPage() {
  const { user, token, loading: authLoading, logout } = useAuth()
  const { getExpenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const router = useRouter()

  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingExpense, setAddingExpense] = useState(false)
  const [total, setTotal] = useState(0)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login')
    }
  }, [token, authLoading, router])

  // Load expenses
  useEffect(() => {
    if (token) {
      loadExpenses()
    }
  }, [token])

  const loadExpenses = async () => {
    setLoading(true)
    const data = await getExpenses()
    if (Array.isArray(data)) {
      setExpenses(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      const sum = data.reduce((acc, exp) => acc + exp.amount, 0)
      setTotal(sum)
    }
    setLoading(false)
  }

  const handleAddExpense = async (amount, category, description) => {
    setAddingExpense(true)
    const result = await addExpense(amount, category, description)
    if (result._id) {
      await loadExpenses()
    } else {
      alert('Erreur lors de l\'ajout de la dépense')
    }
    setAddingExpense(false)
  }

  const handleDeleteExpense = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      await deleteExpense(id)
      await loadExpenses()
    }
  }

  const handleEditExpense = async (id, data) => {
    const result = await updateExpense(id, { amount: data.amount, description: data.description, category: data.category })
    if (result._id) {
      await loadExpenses()
    } else {
      alert('Erreur lors de la modification')
    }
  }

  if (authLoading || !token) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moneto</h1>
            <p className="text-gray-600">Bienvenue, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total des dépenses</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{total.toFixed(2)}€</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Nombre de dépenses</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{expenses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Moyenne par dépense</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {expenses.length > 0 ? (total / expenses.length).toFixed(2) : '0.00'}€
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Expense Form */}
          <div className="lg:col-span-1">
            <AddExpenseForm onAdd={handleAddExpense} loading={addingExpense} />
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique des dépenses</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Chargement...</div>
                </div>
              ) : (
                <ExpenseList
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                  onEdit={handleEditExpense}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
