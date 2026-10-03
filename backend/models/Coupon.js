import mongoose from 'mongoose';
export default mongoose.model('Coupon', new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true }, percent: Number, active: { type: Boolean, default: true },
}));
