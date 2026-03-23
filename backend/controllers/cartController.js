const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product')
    .lean();

  if (!cart) {
    return res.json({ success: true, cart: { items: [] } });
  }

  // Remove items where product was deleted
  cart.items = (cart.items || []).filter((i) => i.product != null);

  res.json({ success: true, cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variantIndex = -1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const price =
    variantIndex >= 0 && product.variants?.[variantIndex]
      ? product.variants[variantIndex].price
      : product.price;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (i) =>
      i.product.toString() === productId &&
      i.variantIndex === Number(variantIndex)
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      variantIndex: Number(variantIndex),
      price,
    });
  }

  await cart.save();
  await cart.populate('items.product');

  res.json({ success: true, cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (Number(quantity) <= 0) {
    item.deleteOne();
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (i) => i._id.toString() !== req.params.itemId
  );

  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};