const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_RENAMED);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Payment service is running'
  });
});

// Direct test charge to Stripe (creates a real transaction that will appear in dashboard)
router.get('/create-test-charge', paymentController.createDirectCharge);

// Test endpoint for creating a payment intent with fixed amount
router.get('/test-payment-intent', async (req, res) => {
  try {
    console.log('Creating test payment intent for 1000 LKR');
    
    // Use the controller directly but with controlled input
    const testRequest = {
      body: {
        orderId: `TEST-${Date.now()}`,
        amount: 1000,
        currency: 'lkr',
        customerEmail: 'test@example.com',
        customerName: 'Test Customer'
      }
    };
    
    const testResponse = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };
    
    await paymentController.createPaymentIntent(testRequest, testResponse);
    
    // Add the request details to the response for debugging
    testResponse.data.testRequest = testRequest.body;
    
    // Return the response directly
    res.status(testResponse.statusCode || 200).json(testResponse.data);
  } catch (error) {
    console.error('Test payment intent error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating test payment intent',
      error: error.message
    });
  }
});

// Direct test for Stripe API
router.get('/test-stripe-connection', async (req, res) => {
  try {
    console.log('Testing Stripe API connection');
    
    // First check that we have a valid Stripe key
    if (!process.env.STRIPE_SECRET_KEY_RENAMED) {
      return res.status(500).json({
        success: false,
        message: 'STRIPE_SECRET_KEY_RENAMED is not configured'
      });
    }
    
    // Test creating a simple customer to verify API access
    const testCustomer = await stripe.customers.create({
      email: 'test_connection@example.com',
      name: 'API Test Customer',
      description: 'Test customer for API verification',
      metadata: {
        test: 'true',
        created: new Date().toISOString()
      }
    });
    
    console.log('Successfully created test customer in Stripe:', testCustomer.id);
    
    // Clean up by deleting the customer
    const deletedCustomer = await stripe.customers.del(testCustomer.id);
    
    return res.status(200).json({
      success: true,
      message: 'Stripe API connection is working properly',
      testResults: {
        customerCreated: !!testCustomer.id,
        customerDeleted: !!deletedCustomer.deleted,
        secretKeyPrefix: process.env.STRIPE_SECRET_KEY_RENAMED.substring(0, 7) + '...',
        publishableKeyPrefix: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED.substring(0, 7) + '...'
      }
    });
  } catch (error) {
    console.error('Stripe connection test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to Stripe API',
      error: error.message,
      type: error.type,
      stripeError: error.raw || error
    });
  }
});

// Get Stripe configuration (publishable key)
router.get('/stripe-config', (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED
  });
});

// Create a payment intent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm-payment', paymentController.confirmPayment);

// Get payment status
router.get('/status/:paymentIntentId', paymentController.getPaymentStatus);

// Get payment by order ID
router.get('/order/:orderId', paymentController.getPaymentByOrderId);

module.exports = router; 