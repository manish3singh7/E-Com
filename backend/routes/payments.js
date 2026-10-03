import { Router } from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, wrap } from '../middleware/auth.js';
const r = Router();
// The backend, not the browser, decides whether a payment is real.
r.post('/verify', protect, wrap(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const sig = String(razorpay_signature || '');
  const ok = expected.length === sig.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  if (!ok) { order.paymentStatus = 'FAILED'; await order.save(); return res.status(400).json({ message: 'Payment could not be verified' }); }
  if (order.paymentStatus !== 'PAID') {
    order.paymentStatus = 'PAID'; order.razorpayPaymentId = razorpay_payment_id; await order.save();
    for (const l of order.products) await Product.findByIdAndUpdate(l.product, { $inc: { stock: -l.qty, sold: l.qty } });
  }
  res.json(order);
}));
export default r;
