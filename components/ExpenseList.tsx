'use client'

import { useState } from 'react'

interface Expense {
  _id: string
  amount: number
  category: string
  description: string
  date: string
  userId: string
}

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onEdit: (id: string, data: Partial<Expense>) => void
}

const categoryIcons: Record<string, string> = {
  'Alimentation': '🍔',
  'Transport': '🚗',
  'Loisirs': '🎮',
  'Sante': '🏥',
  'Logement': '🏠',
  'Vetements': '👕',
  'Autre': '📌'
}

const categoryColors: Record<string, string> = {
  'Alimentation': 'bg-orange-100 text-orange-800',
  'Transport': 'bg-blue-100 text-blue-800',
  'Loisirs': 'bg-purple-100 text-purple-800',
  'Sante': 'bg-red-100 text-red-800',
  'Logement': 'bg-green-100 text-green-800',
  'Vetements': 'bg-pink-100 text-pink-800',
  'Autre': 'bg-gray-100 text-gray-800'
}

export default function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Expense>>({})
  const [editError, setEditError] = useState('')

  const handleEdit = (expense: Expense) => {
    setEditingId(expense._id)
    setEditData({ ...expense })
    setEditError('')
  }

  const handleSave = () => {
    if (editingId) {
      if (!editData.amount || editData.amount <= 0) {
        setEditError('Le montant doit etre superieur a 0')
        return
      }
      if (!editData.description?.trim()) {
        setEditError('La description ne peut pas etre vide')
        return
      }
      onEdit(editingId, editData)
      setEditingId(null)
      setEditError('')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditError('')
  }

  if (expenses.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg'>Aucune depense enregistree</p>
        <p className='text-gray-400 text-sm'>Commencez a ajouter des depenses</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {expenses.map((expense) => (
        <div key={expense._id} className='bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4'>
          {editingId === expense._id ? (
            <div className='space-y-3'>
              {editError && (
                <div className='p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
                  {editError}
                </div>
              )}
              <input
                type='number'
                value={editData.amount || ''}
                onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                step='0.01'
                min='0.01'
              />
              <input
                type='text'
                value={editData.description || ''}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder='Description'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              />
              <div className='flex gap-2'>
                <button onClick={handleSave} className='flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition'>
                  Enregistrer
                </button>
                <button onClick={handleCancel} className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition'>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <span className='text-2xl'>{categoryIcons[expense.category] || '📌'}</span>
                    <span className={'inline-block px-3 py-1 rounded-full text-sm font-medium ' + (categoryColors[expense.category] || categoryColors['Autre'])}>
                      {expense.category}
                    </span>
                  </div>
                  <p className='text-gray-700 font-medium'>{expense.description}</p>
                  <p className='text-gray-500 text-sm'>{new Date(expense.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-blue-600'>{expense.amount.toFixed(2)} euros</p>
                </div>
              </div>
              <div className='flex gap-2 mt-4 pt-4 border-t'>
                <button onClick={() => handleEdit(expense)} className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition text-sm'>
                  Modifier
                </button>
                <button onClick={() => onDelete(expense._id)} className='flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition text-sm'>
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
