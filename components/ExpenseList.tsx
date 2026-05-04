'use client'

import { useState } from 'react'
import { Expense } from '@/types/expense'
import { CATEGORIES } from './AddExpenseForm'
import { useCurrency } from '@/context/CurrencyContext'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onEdit: (id: string, data: Partial<Expense>) => void
}

const categoryIcons: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Entertainment: '🎮',
  Health: '🏥',
  Housing: '🏠',
  Clothing: '👕',
  Other: '📌',
}

const categoryColors: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Health: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Housing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Clothing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export default function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const { symbol, fromEUR, toEUR } = useCurrency()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editData, setEditData] = useState<Omit<Partial<Expense>, 'amount'>>({})
  const [editError, setEditError] = useState('')

  const handleEdit = (expense: Expense) => {
    setEditingId(expense._id)
    setEditAmount(fromEUR(expense.amount).toFixed(2))
    setEditData({
      category: expense.category,
      description: expense.description,
      date: expense.date.split('T')[0],
    })
    setEditError('')
  }

  const handleSave = () => {
    if (!editingId) return
    const parsed = parseFloat(editAmount)
    if (isNaN(parsed) || parsed <= 0) {
      setEditError('Amount must be greater than 0')
      return
    }
    if (!editData.description?.trim()) {
      setEditError('Description cannot be empty')
      return
    }
    onEdit(editingId, { ...editData, amount: toEUR(parsed) })
    setEditingId(null)
    setEditError('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditError('')
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense._id}
          className="rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 bg-white dark:bg-gray-800"
        >
          {editingId === expense._id ? (
            <div className="space-y-3">
              {editError && (
                <div className="p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded text-sm">
                  {editError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Amount ({symbol})
                  </label>
                  <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={inputClass} step="0.01" min="0.01" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                  <select value={editData.category || ''} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className={inputClass}>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <input type="text" value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                <input type="date" value={editData.date || ''} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className={inputClass} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition text-sm font-medium">Save</button>
                <button onClick={handleCancel} className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition text-sm font-medium">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xl">{categoryIcons[expense.category] ?? '📌'}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[expense.category] ?? categoryColors['Autre']}`}>
                      {expense.category}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium truncate">{expense.description}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                    {new Date(expense.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 ml-4 shrink-0">
                  {fromEUR(expense.amount).toFixed(2)} {symbol}
                </p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => handleEdit(expense)} className="flex-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 py-1.5 rounded-lg transition text-sm font-medium">Edit</button>
                <button onClick={() => onDelete(expense._id)} className="flex-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 py-1.5 rounded-lg transition text-sm font-medium">Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
