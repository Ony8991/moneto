'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export const CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  MUR: { code: 'MUR', symbol: 'Rs', name: 'Roupie mauricienne' },
  MGA: { code: 'MGA', symbol: 'Ar', name: 'Ariary malgache' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

// Taux de change avec l'euro comme base (1 EUR = X devise)
// Taux indicatifs — à mettre à jour périodiquement
const RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  MUR: 48.5,
  MGA: 4850,
}

interface CurrencyContextType {
  currency: CurrencyCode
  symbol: string
  name: string
  setCurrency: (code: CurrencyCode) => void
  /** Convertit un montant stocké en EUR vers la devise affichée */
  fromEUR: (amount: number) => number
  /** Convertit un montant saisi dans la devise affichée vers l'EUR pour stockage */
  toEUR: (amount: number) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('EUR')

  useEffect(() => {
    const saved = localStorage.getItem('currency') as CurrencyCode | null
    if (saved && saved in CURRENCIES) setCurrencyState(saved)
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    localStorage.setItem('currency', code)
    setCurrencyState(code)
  }

  const fromEUR = (amount: number) => amount * RATES[currency]
  const toEUR = (amount: number) => amount / RATES[currency]

  return (
    <CurrencyContext.Provider value={{
      currency,
      symbol: CURRENCIES[currency].symbol,
      name: CURRENCIES[currency].name,
      setCurrency,
      fromEUR,
      toEUR,
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider')
  return context
}
