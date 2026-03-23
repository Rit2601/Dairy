const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { isWithinDeliveryRadius } = require('../utils/distance');

const createOrder = asyncHandler(async (req, res) => {
  const {
    address,
    deliverySlot,
    paymentMethod,
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  // Delivery radius check (only if coordinates provided)
  if (address?.lat && address?.lng) {
    const { inRange } = isWithinDeliveryRadius(
      parseFloat(address.lat),
      parseFloat(address.lng)
    );
    if (!inRange) {
      res.status(400);
      throw new Error(
        'Sorry, we currently deliver only within our service area.'
      );
    }
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    address,
    deliverySlot,
    payment: {
      method: paymentMethod,
      status: 'pending',
    },
    subtotal: subtotal || 0,
    deliveryFee: deliveryFee || 0,
    discount: discount || 0,
    total,
    statusHistory: [
      { status: 'placed', note: 'Order placed successfully' },
    ],
  });

  // Clear cart after order
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ success: true, order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({ success: true, order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.status = status;
  order.statusHistory.push({ status, note: note || '' });
  if (status === 'delivered') order.deliveredAt = new Date();
  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancellationReason = note || '';
  }
  await order.save();
  res.json({ success: true, order });
});

const checkDeliveryRadius = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.json({ success: true, inRange: true, distance: 0 });
  }
  const result = isWithinDeliveryRadius(
    parseFloat(lat),
    parseFloat(lng)
  );
  res.json({ success: true, ...result });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  checkDeliveryRadius,
};