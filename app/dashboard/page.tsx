'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/context/AuthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { useCurrency, CURRENCIES, CurrencyCode } from '@/context/CurrencyContext'
import { useTheme } from '@/context/ThemeContext'
import AddExpenseForm from '@/components/AddExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import BudgetSection from '@/components/BudgetSection'
import RecurringSection from '@/components/RecurringSection'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Toast } from '@/components/Toast'
import { Expense } from '@/types/expense'
import { CATEGORIES } from '@/components/AddExpenseForm'

const ExpenseChart = dynamic(() => import('@/components/ExpenseChart'), { ssr: false })
const MonthlyChart = dynamic(() => import('@/components/MonthlyChart'), { ssr: false })

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const { symbol, currency, setCurrency, fromEUR } = useCurrency()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const [categoryFilter, setCategoryFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [search, setSearch] = useState('')

  const { expenses, loading, total, addExpense, updateExpense, deleteExpense, reload } = useExpenses({
    category: categoryFilter || undefined,
    month: monthFilter || undefined,
  })

  useEffect(() => {
    fetch('/api/recurring/apply', { method: 'POST' })
      .then(r => r.json())
      .then(data => { if (data.created > 0) reload() })
      .catch(() => {})
  }, [reload])

  const filteredExpenses = useMemo(() => {
    if (!search.trim()) return expenses
    const q = search.toLowerCase()
    return expenses.filter(
      e =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    )
  }, [expenses, search])

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  )

  const [addingExpense, setAddingExpense] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; expenseId: string | null }>({
    isOpen: false,
    expenseId: null,
  })
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
    type: 'info',
  })

  const showToast = (message: string, type: 'success' | 'error') =>
    setToast({ isOpen: true, message, type })

  if (authLoading) return null
  if (!user) {
    router.push('/login')
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleAddExpense = async (amount: number, category: string, description: string, date: string) => {
    setAddingExpense(true)
    const result = await addExpense(amount, category, description, date)
    showToast(
      result.success ? 'Expense added successfully' : result.error || 'Error while adding',
      result.success ? 'success' : 'error'
    )
    setAddingExpense(false)
  }

  const confirmDelete = async () => {
    if (confirmDialog.expenseId) {
      const result = await deleteExpense(confirmDialog.expenseId)
      showToast(
        result.success ? 'Expense deleted successfully' : result.error || 'Error while deleting',
        result.success ? 'success' : 'error'
      )
    }
    setConfirmDialog({ isOpen: false, expenseId: null })
  }

  const handleEditExpense = async (id: string, data: Partial<Expense>) => {
    const result = await updateExpense(id, data)
    showToast(
      result.success ? 'Expense updated successfully' : result.error || 'Error while updating',
      result.success ? 'success' : 'error'
    )
  }

  const average = filteredExpenses.length > 0 ? filteredTotal / filteredExpenses.length : 0
  const hasFilters = categoryFilter || monthFilter || search

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}

      <header className="bg-white dark:bg-gray-800 shadow transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Moneto</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome, {user.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              title="Change currency"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total expenses</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {loading ? '...' : `${fromEUR(filteredTotal).toFixed(2)} ${symbol}`}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Number of expenses</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {loading ? '...' : filteredExpenses.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Average per expense</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {loading ? '...' : `${fromEUR(average).toFixed(2)} ${symbol}`}
            </p>
          </div>
        </div>

        {/* Budget */}
        <BudgetSection expenses={expenses} />

        {/* Recurring */}
        <RecurringSection onApplied={reload} />

        {/* Charts */}
        {!loading && expenses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart expenses={filteredExpenses} />
            <MonthlyChart />
          </div>
        )}

        {/* Filters + Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-wrap gap-4 items-end transition-colors">
          <div className="flex-1 min-w-36">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-36">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Description or category..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => { setCategoryFilter(''); setMonthFilter(''); setSearch('') }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Reset
            </button>
          )}
        </div>

        {/* Form + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AddExpenseForm onAdd={handleAddExpense} loading={addingExpense} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">History</h2>
                {search && (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Loading...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No expenses</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    {hasFilters ? 'No results for these filters' : 'Start adding expenses'}
                  </p>
                </div>
              ) : (
                <ExpenseList
                  expenses={filteredExpenses}
                  onDelete={(id) => setConfirmDialog({ isOpen: true, expenseId: id })}
                  onEdit={handleEditExpense}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
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
