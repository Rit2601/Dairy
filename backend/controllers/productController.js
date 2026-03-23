const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');

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
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean();

  const normalized = products.map((p) => {
    // Normalize images — support both `image` and `images`
    const images =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : p.image
        ? [p.image]
        : [];

    // Normalize category
    let cat = { name: 'Dairy', slug: 'dairy' };
    if (p.category) {
      const idStr = p.category.toString();
      if (idStr.length !== 24) {
        cat = { name: idStr, slug: idStr.toLowerCase() };
      } else {
        cat = { _id: idStr, name: 'Dairy', slug: 'dairy' };
      }
    }

    return {
      ...p,
      category: cat,
      images,
      slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
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
  });

  res.json({
    success: true,
    products: normalized,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

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

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  res.json({
    success: true,
    product: {
      ...product,
      images,
      slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
      unit: product.unit || '500ml',
      rating: product.rating || 4.0,
      reviewCount: product.reviewCount || 0,
    },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const images = req.files ? req.files.map((f) => f.path) : [];
  const product = await Product.create({ ...req.body, images, isActive: true });
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};