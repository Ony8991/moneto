import { z } from 'zod'

export const createExpenseSchema = z.object({
  amount: z.number().positive('Le montant doit etre positif'),
  category: z.string().min(1, 'La categorie est requise'),
  description: z.string().optional(),
})

export const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
