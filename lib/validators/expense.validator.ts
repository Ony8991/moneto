import { z } from 'zod'

export const createExpenseSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  category: z.string().min(1, 'La catégorie est requise'),
  description: z.string().min(1, 'La description est requise'),
  date: z.string().optional(),
})

export const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  date: z.string().optional(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
