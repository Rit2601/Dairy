const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  price: { type: Number, required: true },
  mrp: { type: Number },
  unit: { type: String, default: '500ml' },
  variants: [{
    label: String,
    price: Number,
    mrp: Number,
    unit: String,
    stock: { type: Number, default: 0 },
  }],
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isFreshToday: { type: Boolean, default: false },
  rating: { type: Number, default: 4.0 },
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  nutritionInfo: {
    calories: Number,
    protein: String,
    fat: String,
    carbs: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);