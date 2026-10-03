import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect, adminOnly, wrap } from '../middleware/auth.js';
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_KEY, api_secret: process.env.CLOUDINARY_SECRET });
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_, f, cb) => cb(null, /^image\/(png|jpe?g|webp)$/.test(f.mimetype)) });
const r = Router();
// React -> backend -> Cloudinary -> URL -> MongoDB
r.post('/', protect, adminOnly, up.single('image'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Attach a PNG, JPG or WebP under 4 MB' });
  const url = await new Promise((ok, no) => cloudinary.uploader.upload_stream({ folder: 'kaarigar' }, (e, d) => (e ? no(e) : ok(d.secure_url))).end(req.file.buffer));
  res.json({ url });
}));
export default r;
