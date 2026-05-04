import { z } from 'zod'

export const createRecurringSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  dayOfMonth: z.number().int().min(1).max(28),
})

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>
