import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany(), Coupon.deleteMany()]);
await User.create({ name: 'Admin', email: 'admin@kaarigar.test', password: 'Admin@12345', role: 'ADMIN' });
const img = (s) => [`https://picsum.photos/seed/${s}/700/700`];
const items = [
  ['Block-print cotton throw', 'Textiles', 1499, 1199, 'Jaipur Loom'], ['Handwoven jute rug', 'Home', 2299, null, 'Jaipur Loom'],
  ['Blue pottery bowl set', 'Kitchen', 899, 749, 'Khurja Kiln'], ['Brass masala dabba', 'Kitchen', 1799, 1599, 'Moradabad Metals'],
  ['Handmade paper journal', 'Stationery', 349, null, 'Sanganer Press'], ['Kantha stitch tote', 'Textiles', 799, 649, 'Bengal Thread'],
  ['Terracotta planter', 'Home', 599, null, 'Khurja Kiln'], ['Wooden pen stand', 'Stationery', 299, 249, 'Saharanpur Wood'],
];
await Product.insertMany(items.map(([name, category, price, discountPrice, brand], i) => ({
  name, category, price, discountPrice: discountPrice || undefined, brand, images: img(`k${i}`), stock: 4 + i * 3,
  rating: 3.5 + (i % 4) * 0.4, sold: i * 7, sizes: [], colors: [], description: `${name}, made by hand by small workshops in India.` })));
await Coupon.create([{ code: 'WELCOME10', percent: 10 }, { code: 'SAVE20', percent: 20 }]);
console.log('Seeded. Admin login: admin@kaarigar.test / Admin@12345');
process.exit(0);
