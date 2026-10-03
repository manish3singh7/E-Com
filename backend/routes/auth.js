import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect, signCookie, wrap } from '../middleware/auth.js';
const r = Router();
const pub = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, address: u.address });

r.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email and a password of 8+ characters are required' });
  if (await User.findOne({ email: String(email).toLowerCase() })) return res.status(409).json({ message: 'That email is already registered' });
  const u = await User.create({ name, email, password }); // role is never taken from the request
  signCookie(res, u._id); res.status(201).json(pub(u));
}));
r.post('/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!u || !(await u.matches(String(req.body.password || '')))) return res.status(401).json({ message: 'Wrong email or password' });
  signCookie(res, u._id); res.json(pub(u));
}));
r.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });
r.get('/me', protect, (req, res) => res.json(pub(req.user)));
r.put('/me', protect, wrap(async (req, res) => {
  req.user.address = req.body.address; await req.user.save(); res.json(pub(req.user));
}));
r.post('/forgot-password', wrap(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (u) {
    const raw = crypto.randomBytes(32).toString('hex');
    u.resetToken = crypto.createHash('sha256').update(raw).digest('hex');
    u.resetExpires = Date.now() + 15 * 60 * 1000; await u.save();
    console.log(`Reset link: ${process.env.CLIENT_URL}/reset/${raw}`); // TODO: send with an email service
  }
  res.json({ message: 'If that email exists, a reset link has been sent' });
}));
r.post('/reset-password/:token', wrap(async (req, res) => {
  const hash = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const u = await User.findOne({ resetToken: hash, resetExpires: { $gt: Date.now() } });
  if (!u || !req.body.password || req.body.password.length < 8) return res.status(400).json({ message: 'Link expired or password too short' });
  u.password = req.body.password; u.resetToken = u.resetExpires = undefined; await u.save();
  res.json({ message: 'Password updated' });
}));
export default r;
