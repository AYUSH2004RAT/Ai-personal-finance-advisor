import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, default: 'Personal', trim: true },
  principalAmount: { type: Number, required: true },
  remainingBalance: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  termMonths: { type: Number, default: 0 },
  nextPaymentDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Loan', loanSchema);
