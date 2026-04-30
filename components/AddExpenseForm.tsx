'use client'

import { useState } from 'react'
import { useCurrency } from '@/context/CurrencyContext'

export const CATEGORIES = [
  'Alimentation',
  'Transport',
  'Loisirs',
  'Santé',
  'Logement',
  'Vêtements',
  'Autre',
]

interface AddExpenseFormProps {
  onAdd: (amountEUR: number, category: string, description: string, date: string) => void
  loading: boolean
}

export default function AddExpenseForm({ onAdd, loading }: AddExpenseFormProps) {
  const { symbol, toEUR } = useCurrency()
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Alimentation')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const parsed = parseFloat(amount)
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Le montant doit être positif')
      return
    }
    if (!description.trim()) {
      setError('La description est requise')
      return
    }
    onAdd(toEUR(parsed), category, description.trim(), date)
    setAmount('')
    setDescription('')
    setDate(today)
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ajouter une dépense</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Montant ({symbol})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Courses au supermarché"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            className={inputClass}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter la dépense'}
        </button>
      </form>
    </div>
  )
}
