import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly, wrap } from '../middleware/auth.js';
const r = Router();
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = { newest: { createdAt: -1 }, popular: { sold: -1 }, rating: { rating: -1 }, 'price-asc': { price: 1 }, 'price-desc': { price: -1 } };
const FIELDS = ['name', 'description', 'price', 'discountPrice', 'images', 'category', 'brand', 'sizes', 'colors', 'stock'];
const pick = (b) => Object.fromEntries(FIELDS.filter((k) => k in b).map((k) => [k, b[k]]));

r.get('/', wrap(async (req, res) => {
  const { q, category, brand, minPrice, maxPrice, rating, size, color, sort = 'newest', page = 1, limit = 12 } = req.query;
  const f = {};
  if (q) f.name = { $regex: esc(q), $options: 'i' };
  if (category) f.category = String(category);
  if (brand) f.brand = String(brand);
  if (size) f.sizes = String(size);
  if (color) f.colors = String(color);
  if (rating) f.rating = { $gte: Number(rating) };
  if (minPrice || maxPrice) f.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
  const lim = Math.min(Number(limit) || 12, 48), skip = (Math.max(Number(page), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    Product.find(f).select('-reviews').sort(SORTS[sort] || SORTS.newest).skip(skip).limit(lim), Product.countDocuments(f)]);
  res.json({ items, total, pages: Math.ceil(total / lim) });
}));
r.get('/:id', wrap(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
}));
r.post('/', protect, adminOnly, wrap(async (req, res) => res.status(201).json(await Product.create(pick(req.body)))));
r.put('/:id', protect, adminOnly, wrap(async (req, res) =>
  res.json(await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true }))));
r.delete('/:id', protect, adminOnly, wrap(async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
r.post('/:id/reviews', protect, wrap(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  if (p.reviews.some((x) => x.user.equals(req.user._id))) return res.status(400).json({ message: 'You already reviewed this product' });
  p.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(req.body.rating), comment: req.body.comment });
  p.rating = p.reviews.reduce((a, x) => a + x.rating, 0) / p.reviews.length;
  await p.save(); res.status(201).json(p);
}));
export default r;
