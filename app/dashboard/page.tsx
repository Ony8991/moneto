'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useExpenses } from '@/hooks/useExpenses'
import AddExpenseForm from '@/components/AddExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Toast } from '@/components/Toast'

interface Expense {
  _id: string
  amount: number
  category: string
  description: string
  date: string
  userId: string
}

export default function DashboardPage() {
  const { user, token, loading: authLoading, logout } = useAuth()
  const { getExpenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const router = useRouter()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [addingExpense, setAddingExpense] = useState(false)
  const [total, setTotal] = useState(0)
  
  // Dialog and Toast states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    expenseId: string | null
  }>({ isOpen: false, expenseId: null })
  const [toast, setToast] = useState<{
    isOpen: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({ isOpen: false, message: '', type: 'info' })

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
      setExpenses(data.sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      const sum = data.reduce((acc: number, exp: Expense) => acc + exp.amount, 0)
      setTotal(sum)
    }
    setLoading(false)
  }

  const handleAddExpense = async (amount: number, category: string, description: string) => {
    setAddingExpense(true)
    const result = await addExpense(amount, category, description)
    if (result.success && result.data) {
      await loadExpenses()
      setToast({ isOpen: true, message: 'Dépense ajoutée avec succès', type: 'success' })
    } else {
      setToast({ isOpen: true, message: result.error || 'Erreur lors de l\'ajout', type: 'error' })
    }
    setAddingExpense(false)
  }

  const handleDeleteExpense = async (id: string) => {
    setConfirmDialog({ isOpen: true, expenseId: id })
  }

  const confirmDelete = async () => {
    if (confirmDialog.expenseId) {
      const result = await deleteExpense(confirmDialog.expenseId)
      if (result.success) {
        await loadExpenses()
        setToast({ isOpen: true, message: 'Dépense supprimée avec succès', type: 'success' })
      } else {
        setToast({ isOpen: true, message: result.error || 'Erreur lors de la suppression', type: 'error' })
      }
    }
    setConfirmDialog({ isOpen: false, expenseId: null })
  }

  const handleEditExpense = async (id: string, data: Partial<Expense>) => {
    const result = await updateExpense(id, data)
    if (result.success && result.data) {
      await loadExpenses()
      setToast({ isOpen: true, message: 'Dépense modifiée avec succès', type: 'success' })
    } else {
      setToast({ isOpen: true, message: result.error || 'Erreur lors de la modification', type: 'error' })
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
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {loading ? '...' : total.toFixed(2)}€
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Nombre de dépenses</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {loading ? '...' : expenses.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Moyenne par dépense</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {loading ? '...' : (expenses.length > 0 ? (total / expenses.length).toFixed(2) : '0.00')}€
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
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <div className="text-gray-500">Chargement des dépenses...</div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-500 text-lg">Aucune dépense enregistrée</p>
                  <p className="text-gray-400 text-sm">Commencez à ajouter des dépenses</p>
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

      {/* Dialogs and Toasts */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Supprimer la dépense"
        message="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action ne peut pas être annulée."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, expenseId: null })}
      />
      
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  )
}
