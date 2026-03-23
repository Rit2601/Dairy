const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Helper to get full image URL
const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base =
    process.env.BACKEND_URL ||
    `https://shridhar-dairy-api.onrender.com`;
  return `${base}${url}`;
};

// Helper to normalize a product document
const normalizeProduct = (p) => {
  const rawImages = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : p.image
    ? [p.image]
    : [];

  const images = rawImages.map(getFullImageUrl).filter(Boolean);

  let cat = { name: 'Dairy', slug: 'dairy' };
  if (p.category) {
    const idStr = p.category.toString();
    if (idStr.length !== 24) {
      cat = { name: idStr, slug: idStr.toLowerCase().replace(/\s+/g, '-') };
    } else {
      cat = { _id: idStr, name: 'Dairy', slug: 'dairy' };
    }
  }

  return {
    ...p,
    category: cat,
    images,
    slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-') || String(p._id),
    unit: p.unit || '500ml',
    rating: p.rating || 4.0,
    reviewCount: p.reviewCount || 0,
    stock: p.stock ?? 0,
    price: p.price ?? 0,
    mrp: p.mrp || null,
    isFeatured: p.isFeatured ?? false,
    isBestSeller: p.isBestSeller ?? false,
    isFreshToday: p.isFreshToday ?? false,
  };
};

// @desc  Get all products
// @route GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    featured,
    bestSeller,
    fresh,
    search,
    page = 1,
    limit = 50,
  } = req.query;

  const filter = { isActive: true };

  if (featured === 'true') filter.isFeatured = true;
  if (bestSeller === 'true') filter.isBestSeller = true;
  if (fresh === 'true') filter.isFreshToday = true;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean();

  const normalized = products.map(normalizeProduct);

  res.json({
    success: true,
    products: normalized,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// @desc  Get product by slug
// @route GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  let product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    const nameFromSlug = slug.replace(/-/g, ' ');
    product = await Product.findOne({
      name: { $regex: nameFromSlug, $options: 'i' },
      isActive: true,
    }).lean();
  }

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product: normalizeProduct(product) });
});

// @desc  Create product (admin)
// @route POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const images = req.files ? req.files.map((f) => f.path) : [];
  const product = await Product.create({
    ...req.body,
    images,
    isActive: true,
  });
  res.status(201).json({ success: true, product });
});

// @desc  Update product (admin)
// @route PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc  Delete product (admin)
// @route DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, message: 'Product deleted' });
});

// @desc  Get product by ID (admin)
// @route GET /api/products/id/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product: normalizeProduct(product) });
});

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};