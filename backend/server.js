const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static product images
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check — Render pings this to verify app is running
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🥛 Shridhar Dairy API Running',
    env: process.env.NODE_ENV || 'development',
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🥛 Shridhar Dairy server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections — prevent crash
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

// Handle uncaught exceptions — prevent crash
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});