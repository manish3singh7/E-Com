import { Router } from 'express';
import Razorpay from 'razorpay';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly, wrap } from '../middleware/auth.js';
const r = Router(); r.use(protect);

r.post('/', wrap(async (req, res) => {
  const { items = [], shippingAddress, coupon } = req.body;
  if (!items.length || !shippingAddress) return res.status(400).json({ message: 'Cart and address are required' });
  const lines = [];
  for (const it of items) {              // prices come from the database, never from the browser
    const p = await Product.findById(it.productId);
    const qty = Math.max(1, Number(it.qty) || 1);
    if (!p || p.stock < qty) return res.status(400).json({ message: `${p?.name || 'An item'} is out of stock` });
    lines.push({ product: p._id, name: p.name, image: p.images[0], price: p.discountPrice || p.price, qty });
  }
  const itemsTotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const c = coupon ? await Coupon.findOne({ code: String(coupon).toUpperCase(), active: true }) : null;
  const discount = c ? Math.round(itemsTotal * c.percent / 100) : 0;
  const shipping = itemsTotal >= 999 ? 0 : 79;
  const tax = Math.round((itemsTotal - discount) * 0.05);
  const totalAmount = itemsTotal - discount + shipping + tax;
  const order = await Order.create({ user: req.user._id, products: lines, shippingAddress, itemsTotal, shipping, tax, discount, totalAmount, coupon: c?.code });
  const rp = new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET });
  const rpOrder = await rp.orders.create({ amount: totalAmount * 100, currency: 'INR', receipt: String(order._id) });
  order.razorpayOrderId = rpOrder.id; await order.save();
  res.status(201).json({ order, razorpayOrder: rpOrder, key: process.env.RAZORPAY_KEY });
}));
r.get('/', wrap(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort('-createdAt'))));
r.get('/admin/all', adminOnly, wrap(async (req, res) => res.json(await Order.find().populate('user', 'name email').sort('-createdAt'))));
r.put('/:id/status', adminOnly, wrap(async (req, res) =>
  res.json(await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true, runValidators: true }))));
r.get('/:id', wrap(async (req, res) => {
  const o = await Order.findById(req.params.id);
  if (!o || (!o.user.equals(req.user._id) && req.user.role !== 'ADMIN')) return res.status(404).json({ message: 'Order not found' });
  res.json(o);
}));
export default r;
