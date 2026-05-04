'use client'

import { useState } from 'react'
import { useRecurring } from '@/hooks/useRecurring'
import { CATEGORIES } from './AddExpenseForm'
import { useCurrency } from '@/context/CurrencyContext'

export default function RecurringSection({ onApplied }: { onApplied: () => void }) {
  const { items, loading, add, remove } = useRecurring()
  const { symbol, fromEUR, toEUR } = useCurrency()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const parsed = parseFloat(amount)
    if (!amount || isNaN(parsed) || parsed <= 0) { setError('Amount must be positive'); return }
    if (!description.trim()) { setError('Description is required'); return }
    setSaving(true)
    const result = await add(toEUR(parsed), category, description.trim(), parseInt(dayOfMonth))
    setSaving(false)
    if (result.success) {
      setAmount(''); setDescription(''); setDayOfMonth('1'); setOpen(false)
      onApplied()
    } else {
      setError(result.error || 'Error')
    }
  }

  const handleRemove = async (id: string) => {
    await remove(id)
    onApplied()
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recurring expenses</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500">Generated automatically each month</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          {open ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleAdd} className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
          {error && (
            <div className="p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Amount ({symbol})</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" min="0.01" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Day of month</label>
              <input type="number" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} min="1" max="28" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="E.g. Rent, Netflix..." className={inputClass} />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : 'Save recurring expense'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">No recurring expenses. Click &quot;+ Add&quot; to create one.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.category} · day {item.dayOfMonth} of each month</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {fromEUR(item.amount).toFixed(2)} {symbol}
                </span>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-red-400 hover:text-red-600 text-xs font-medium transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
