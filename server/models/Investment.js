import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  symbol: { type: String, required: true, trim: true },
  type: { type: String, default: 'Stock', trim: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Investment', investmentSchema);
