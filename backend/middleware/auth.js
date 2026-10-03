import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const signCookie = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const prod = process.env.NODE_ENV === 'production';
  res.cookie('token', token, { httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax', maxAge: 7 * 864e5 });
};
export const protect = async (req, res, next) => {
  try {
    const { id } = jwt.verify(req.cookies.token || '', process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) throw new Error();
    next();
  } catch { res.status(401).json({ message: 'Please log in' }); }
};
export const adminOnly = (req, res, next) =>
  req.user?.role === 'ADMIN' ? next() : res.status(403).json({ message: 'Admins only' });
export const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
