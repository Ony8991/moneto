import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  recurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringExpense',
    default: null,
  },
  generatedMonth: {
    type: String,
    default: null,
  },
})

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)

export default Expense
