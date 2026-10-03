import mongoose from 'mongoose';
const review = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, name: String,
  rating: { type: Number, min: 1, max: 5, required: true }, comment: String,
}, { timestamps: true });
const s = new mongoose.Schema({
  name: { type: String, required: true }, description: String,
  price: { type: Number, required: true, min: 0 }, discountPrice: { type: Number, min: 0 },
  images: [String], category: { type: String, index: true }, brand: String,
  sizes: [String], colors: [String],
  stock: { type: Number, default: 0, min: 0 }, sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }, reviews: [review],
}, { timestamps: true });
export default mongoose.model('Product', s);
