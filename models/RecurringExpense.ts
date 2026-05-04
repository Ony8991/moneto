import mongoose from 'mongoose'

const RecurringExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  dayOfMonth: { type: Number, required: true, min: 1, max: 28 },
})

const RecurringExpense =
  mongoose.models.RecurringExpense ||
  mongoose.model('RecurringExpense', RecurringExpenseSchema)

export default RecurringExpense
