const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate essential environment variables
const requiredEnvVars = ['STRIPE_SECRET_KEY_RENAMED', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length) {
  console.error('Error: Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
  process.exit(1);
}

// Log partial keys for debugging (hiding most of sensitive information)
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY_RENAMED.substring(0, 8) + '...');
console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY_RENAMED.substring(0, 8) + '...');
console.log('MONGODB_URI:', process.env.MONGODB_URI.split('@')[0] + '...');

// Import routes
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5002', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet());
app.use(express.json());

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    stripe: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED ? 'configured' : 'missing'
  });
});

// Debug route to check Stripe configuration
app.get('/debug-config', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).send('Not available in production');
  }
  
  res.status(200).json({
    environment: process.env.NODE_ENV || 'development',
    stripeSecretKeyExists: !!process.env.STRIPE_SECRET_KEY_RENAMED,
    stripePublishableKeyExists: !!process.env.STRIPE_PUBLISHABLE_KEY_RENAMED,
    stripePublishableKeyPrefix: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED?.substring(0, 7),
    mongodbUriExists: !!process.env.MONGODB_URI
  });
});

// Routes
app.use('/api/payments', paymentRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

module.exports = app; // For testing
