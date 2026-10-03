import { Router } from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly, wrap } from '../middleware/auth.js';
const r = Router(); r.use(protect, adminOnly);
r.get('/stats', wrap(async (req, res) => {
  const since = new Date(Date.now() - 7 * 864e5);
  const [sales, orders, users, recent, lowStock, daily] = await Promise.all([
    Order.aggregate([{ $match: { paymentStatus: 'PAID' } }, { $group: { _id: null, t: { $sum: '$totalAmount' } } }]),
    Order.countDocuments(), User.countDocuments(),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name'),
    Product.find({ stock: { $lte: 5 } }).select('name stock').limit(10),
    Order.aggregate([{ $match: { paymentStatus: 'PAID', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } }, { $sort: { _id: 1 } }]),
  ]);
  res.json({ sales: sales[0]?.t || 0, orders, users, recent, lowStock, daily });
}));
r.get('/users', wrap(async (req, res) => res.json(await User.find().select('-password -cart -wishlist').sort('-createdAt'))));
r.get('/coupons', wrap(async (req, res) => res.json(await Coupon.find())));
r.post('/coupons', wrap(async (req, res) => res.status(201).json(await Coupon.create({ code: req.body.code, percent: req.body.percent }))));
r.delete('/coupons/:id', wrap(async (req, res) => { await Coupon.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
export default r;
