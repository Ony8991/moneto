'use client'

import { useState } from 'react'
import { Expense } from '@/types/expense'
import { CATEGORIES } from './AddExpenseForm'
import { useBudgets } from '@/hooks/useBudgets'
import { useCurrency } from '@/context/CurrencyContext'

interface Props {
  expenses: Expense[]
}

export default function BudgetSection({ expenses }: Props) {
  const { budgets, loading, saveBudgets } = useBudgets()
  const { symbol, fromEUR, toEUR } = useCurrency()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const spendingByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})

  const handleEditOpen = () => {
    const initial: Record<string, string> = {}
    CATEGORIES.forEach(cat => {
      const budgetEUR = budgets[cat] ?? 0
      initial[cat] = budgetEUR > 0 ? fromEUR(budgetEUR).toFixed(2) : ''
    })
    setDraft(initial)
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const newBudgets: Record<string, number> = {}
    CATEGORIES.forEach(cat => {
      const val = parseFloat(draft[cat])
      if (!isNaN(val) && val > 0) {
        newBudgets[cat] = toEUR(val)
      }
    })
    await saveBudgets(newBudgets)
    setSaving(false)
    setEditing(false)
  }

  if (loading) return null

  const hasBudgets = CATEGORIES.some(cat => (budgets[cat] ?? 0) > 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Budget mensuel</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Basé sur les dépenses actuellement chargées
          </p>
        </div>
        {!editing ? (
          <button
            onClick={handleEditOpen}
            className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
          >
            Modifier les budgets
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {!hasBudgets && !editing && (
        <p className="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">
          Aucun budget défini. Cliquez sur "Modifier les budgets" pour en ajouter.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {CATEGORIES.map(cat => {
          const budgetEUR = budgets[cat] ?? 0
          const spentEUR = spendingByCategory[cat] ?? 0
          const budgetDisplay = fromEUR(budgetEUR)
          const spentDisplay = fromEUR(spentEUR)
          const pct = budgetEUR > 0 ? Math.min((spentEUR / budgetEUR) * 100, 100) : 0
          const overBudget = budgetEUR > 0 && spentEUR > budgetEUR

          if (!editing && budgetEUR === 0) return null

          if (editing) {
            return (
              <div key={cat} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{cat}</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={draft[cat] ?? ''}
                    onChange={e => setDraft({ ...draft, [cat]: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{symbol}</span>
                </div>
              </div>
            )
          }

          const barColor = overBudget
            ? 'bg-red-500'
            : pct >= 80
            ? 'bg-orange-400'
            : 'bg-green-500'

          return (
            <div key={cat} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</p>
                {overBudget && (
                  <span className="text-xs font-semibold text-red-500">Dépassé</span>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                <span>{spentDisplay.toFixed(2)} {symbol}</span>
                <span>/ {budgetDisplay.toFixed(2)} {symbol}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
