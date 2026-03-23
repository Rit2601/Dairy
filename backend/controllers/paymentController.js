const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured in environment variables');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc  Create Razorpay order
// @route POST /api/payments/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    res.status(400);
    throw new Error('Amount and orderId are required');
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const razorpay = getRazorpay();

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(Number(amount) * 100),
    currency: 'INR',
    receipt: `df_${orderId.toString().slice(-8)}_${Date.now()}`,
    notes: {
      orderId: orderId.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.payment.razorpayOrderId = rzpOrder.id;
  await order.save();

  res.json({
    success: true,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc  Verify Razorpay payment
// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId,
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    res.status(400);
    throw new Error('All payment fields are required');
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error('Payment verification failed — invalid signature');
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update order payment details
  order.payment.razorpayOrderId = razorpayOrderId;
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.status = 'paid';
  order.payment.paidAt = new Date();
  order.status = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    note: 'Payment received via Razorpay',
    timestamp: new Date(),
  });
  await order.save();

  // Save payment record
  await Payment.create({
    user: req.user._id,
    order: orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount: order.total,
    currency: 'INR',
    status: 'paid',
    method: 'razorpay',
  });

  res.json({
    success: true,
    message: 'Payment verified successfully',
    orderId: order._id,
  });
});

// @desc  Get payment status
// @route GET /api/payments/status/:orderId
const getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    paymentStatus: order.payment.status,
    orderStatus: order.status,
    method: order.payment.method,
    paidAt: order.payment.paidAt,
  });
});

module.exports = { createRazorpayOrder, verifyPayment, getPaymentStatus };