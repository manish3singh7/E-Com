import { Router } from 'express';
import { protect, wrap } from '../middleware/auth.js';
const r = Router(); r.use(protect);
const send = async (req, res) => { await req.user.populate('cart.product', 'name price discountPrice images stock'); res.json(req.user.cart); };
r.get('/', wrap(send));
r.post('/', wrap(async (req, res) => {
  const { productId, qty = 1 } = req.body; const line = req.user.cart.find((c) => c.product.equals(productId));
  if (line) line.qty += qty; else req.user.cart.push({ product: productId, qty });
  await req.user.save(); await send(req, res);
}));
r.put('/:id', wrap(async (req, res) => {
  const line = req.user.cart.find((c) => c.product.equals(req.params.id));
  if (line) line.qty = Math.max(1, Number(req.body.qty)); await req.user.save(); await send(req, res);
}));
r.delete('/:id', wrap(async (req, res) => {
  req.user.cart = req.user.cart.filter((c) => !c.product.equals(req.params.id)); await req.user.save(); await send(req, res);
}));
export default r;
