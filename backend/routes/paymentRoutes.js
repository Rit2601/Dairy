const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;