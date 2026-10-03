import { Router } from 'express';
import { protect, wrap } from '../middleware/auth.js';
const r = Router(); r.use(protect);
r.get('/', wrap(async (req, res) => res.json(req.user.wishlist)));
r.post('/:id', wrap(async (req, res) => {
  const has = req.user.wishlist.some((i) => i.equals(req.params.id));
  req.user.wishlist = has ? req.user.wishlist.filter((i) => !i.equals(req.params.id)) : [...req.user.wishlist, req.params.id];
  await req.user.save(); res.json(req.user.wishlist);
}));
export default r;
