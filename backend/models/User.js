import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  address: { line1: String, city: String, state: String, pincode: String, phone: String },
  cart: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, qty: { type: Number, default: 1 } }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  resetToken: String, resetExpires: Date,
}, { timestamps: true });
s.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
  next();
});
s.methods.matches = function (p) { return bcrypt.compare(p, this.password); };
export default mongoose.model('User', s);
