import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  description: { type: String, trim: true, default: '' },
  status: { type: String, default: 'Completed', enum: ['Completed', 'Pending'] }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
