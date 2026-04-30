import mongoose from 'mongoose'

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // { "Alimentation": 300, "Transport": 100, ... } stocké en EUR
  categories: {
    type: Object,
    default: {},
  },
})

const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema)

export default Budget
