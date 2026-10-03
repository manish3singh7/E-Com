import mongoose from 'mongoose';
const s = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, price: Number, qty: Number }],
  shippingAddress: { line1: String, city: String, state: String, pincode: String, phone: String },
  itemsTotal: Number, shipping: Number, tax: Number, discount: Number, totalAmount: Number, coupon: String,
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'], default: 'PLACED' },
  razorpayOrderId: String, razorpayPaymentId: String,
}, { timestamps: true });
export default mongoose.model('Order', s);
