'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Expense } from '@/types/expense'
import { useCurrency } from '@/context/CurrencyContext'

const CATEGORY_COLORS: Record<string, string> = {
  Alimentation: '#f97316',
  Transport: '#3b82f6',
  Loisirs: '#a855f7',
  Santé: '#ef4444',
  Logement: '#22c55e',
  Vêtements: '#ec4899',
  Autre: '#6b7280',
}

interface Props {
  expenses: Expense[]
}

export default function ExpenseChart({ expenses }: Props) {
  const { symbol, fromEUR } = useCurrency()

  const data = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + fromEUR(e.amount)
      return acc
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Répartition par catégorie</h2>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Total : {total.toFixed(2)} {symbol}</p>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="w-full lg:w-1/2" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#6b7280'} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} ${symbol}`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-1/2 space-y-2">
          {data.map((entry) => {
            const pct = total > 0 ? (entry.value / total) * 100 : 0
            return (
              <div key={entry.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.name] ?? '#6b7280' }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.value.toFixed(2)} {symbol}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[entry.name] ?? '#6b7280' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
