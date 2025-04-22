const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_RENAMED, {
  apiVersion: '2022-11-15', // Specify the API version for consistency
  maxNetworkRetries: 2, // Add automatic retrying for better reliability
});
const Payment = require('../models/Payment');

// Simple locking mechanism to prevent duplicate payment intents
const activePaymentRequests = new Map();

// Helper to format Stripe errors consistently
const handleStripeError = (error) => {
  console.error('Stripe Error:', error);
  
  // Check for specific Stripe error types
  let message = 'An error occurred while processing your payment';
  let statusCode = 500;
  
  if (error.type === 'StripeCardError') {
    // Card errors are the most common - these are errors from the card being declined
    message = error.message || 'Your card was declined';
    statusCode = 400;
  } else if (error.type === 'StripeInvalidRequestError') {
    // Invalid parameters were supplied to Stripe's API
    message = 'Invalid payment information';
    statusCode = 400;
  } else if (error.type === 'StripeAPIError') {
    // API errors represent errors communicating with Stripe
    message = 'Payment system error';
    statusCode = 503;
  } else if (error.type === 'StripeConnectionError') {
    // Network error communicating with Stripe
    message = 'Network error while processing payment';
    statusCode = 503;
  } else if (error.type === 'StripeAuthenticationError') {
    // Authentication with Stripe failed
    message = 'Payment system configuration error';
    console.error('Stripe API key may be invalid');
    statusCode = 500;
  }
  
  return { message, statusCode, error };
};

// Create a direct charge to test Stripe connectivity
exports.createDirectCharge = async (req, res) => {
  try {
    // Create a token for testing (this bypasses the need for real card info)
    const token = await stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2030,
        cvc: '123',
      },
    });

    // Create a charge directly
    const charge = await stripe.charges.create({
      amount: 2000, // $20.00 in cents
      currency: 'usd',
      source: token.id,
      description: 'Test charge via API',
    });

    res.status(200).json({
      success: true,
      charge: charge
    });
  } catch (error) {
    console.error('Direct charge error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  // Check if this order is already being processed
  const { orderId } = req.body;
  
  // Return early if a request for this order is already in progress
  if (activePaymentRequests.has(orderId)) {
    console.log(`Payment request for order ${orderId} is already in progress. Skipping duplicate request.`);
    return res.status(409).json({
      success: false,
      message: 'A payment request for this order is already being processed'
    });
  }

  // Lock this order ID to prevent duplicate requests
  activePaymentRequests.set(orderId, Date.now());
  
  try {
    console.log('Request Body:', req.body);
    const { amount, currency = 'LKR', customerEmail, customerName } = req.body;

    if (!amount || !orderId) {
      console.log('Missing required fields:', { amount, orderId });
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and orderId are required' 
      });
    }

    // Convert to number if string
    const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // For LKR, we need to ensure amount is at least $0.50 USD equivalent 
    // For Sri Lankan Rupee (approximately 300 LKR to 1 USD)
    if (currency.toLowerCase() === 'lkr' && amountValue < 150) {
      console.log('Amount too small for Stripe:', amountValue, 'LKR');
      return res.status(400).json({
        success: false,
        message: `Amount must be at least 150 LKR to meet Stripe's minimum requirement. Got: ${amountValue} LKR`
      });
    }

    // Check if a payment intent already exists for this order
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment && existingPayment.status !== 'failed') {
      console.log('Existing payment found for order:', orderId, existingPayment.stripePaymentIntentId);
      
      try {
        // Get the payment intent from Stripe to ensure it's still valid
        const existingIntent = await stripe.paymentIntents.retrieve(existingPayment.stripePaymentIntentId);
        
        if (existingIntent && existingIntent.status !== 'canceled') {
          console.log('Returning existing payment intent:', existingIntent.id);
          return res.status(200).json({
            success: true,
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED,
            message: 'Using existing payment intent'
          });
        }
      } catch (err) {
        console.log('Error retrieving existing intent, will create new one:', err.message);
        // Continue to create a new one if the existing one can't be retrieved
      }
    }

    // To debug Stripe key
    console.log('Using Stripe key:', process.env.STRIPE_SECRET_KEY_RENAMED?.substring(0, 8) + '...');

    const amountInCents = Math.round(amountValue * 100); // Stripe requires amounts in cents
    console.log('Creating payment intent with Stripe:', { 
      amount: amountInCents,
      amountDecimal: amountValue,
      currency: currency.toLowerCase(),
      orderId
    });

    // For testing or initialization requests
    if (orderId.startsWith('TEST-') || orderId.startsWith('INIT-')) {
      console.log('Test/Init request detected, sending more detailed response');
      
      // Create a real test payment intent for TEST requests so they show in the dashboard
      if (orderId.startsWith('TEST-')) {
        const testIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: currency.toLowerCase(),
          payment_method_types: ['card'],
          description: `Test payment for ${orderId}`,
          metadata: { test: 'true', orderId }
        });
        
        console.log('Created test payment intent:', testIntent.id);
        
        // Confirm it directly with a test card for TEST requests
        const confirmed = await stripe.paymentIntents.confirm(testIntent.id, {
          payment_method_data: {
            type: 'card',
            card: {
              token: 'tok_visa', // Special test token that represents a Visa card
            },
          },
        });
        
        console.log('Confirmed test payment intent:', confirmed.id, confirmed.status);
        
        return res.status(200).json({
          success: true,
          testPayment: {
            id: testIntent.id,
            status: confirmed.status,
            amount: testIntent.amount / 100,
            currency: testIntent.currency
          },
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED
        });
      }
      
      return res.status(200).json({
        success: true,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED,
        testDetails: {
          amountReceived: amountValue,
          amountInCents: amountInCents,
          currencyReceived: currency,
          currencyNormalized: currency.toLowerCase()
        }
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(), // Ensure lowercase for Stripe
      payment_method_types: ['card'],
      description: `Payment for order ${orderId}`,
      receipt_email: customerEmail,
      capture_method: 'automatic',
      confirm: false, // Don't confirm automatically, client will confirm
      confirmation_method: 'automatic',
      metadata: {
        orderId,
        customerEmail: customerEmail || '',
        customerName: customerName || ''
      }
    });

    console.log('Payment intent created:', { 
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret ? 'exists' : 'missing',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    // Save payment record to database
    const payment = new Payment({
      orderId,
      amount: amountValue,
      currency,
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      customerEmail,
      customerName
    });

    await payment.save();
    console.log('Payment record saved to database for order:', orderId, 'intent:', paymentIntent.id);

    // Make sure the response includes all required fields
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_RENAMED
    });
  } catch (error) {
    const { message, statusCode } = handleStripeError(error);
    
    console.error('Payment intent creation error details:', {
      type: error.type,
      code: error.code,
      message: error.message,
      param: error.param
    });
    
    res.status(statusCode).json({ 
      success: false, 
      message,
      details: process.env.NODE_ENV === 'production' ? undefined : {
        type: error.type,
        code: error.code,
        original: error.message
      }
    });
  } finally {
    // Release the lock for this order ID
    activePaymentRequests.delete(orderId);
    console.log(`Released lock for order ${orderId}`);
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment intent ID is required' 
      });
    }

    console.log('Confirming payment for intent:', paymentIntentId);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Retrieved payment intent with status:', paymentIntent.status);

    // For pending payments that need to be explicitly captured
    if (paymentIntent.status === 'requires_capture') {
      try {
        console.log('Capturing payment intent:', paymentIntentId);
        const capturedIntent = await stripe.paymentIntents.capture(paymentIntentId);
        console.log('Payment captured successfully:', capturedIntent.status);
      } catch (captureError) {
        console.error('Error capturing payment:', captureError);
      }
    }

    // Update the payment record in the database
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      console.log('Payment record not found in database');
      return res.status(404).json({ 
        success: false, 
        message: 'Payment record not found' 
      });
    }

    // Refresh the payment intent details after capture attempt
    const updatedIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Update payment status based on the payment intent status
    payment.status = updatedIntent.status === 'succeeded' ? 'completed' : 
                     updatedIntent.status === 'canceled' ? 'failed' : 
                     updatedIntent.status === 'requires_action' ? 'pending' : payment.status;
                    
    // If there's a payment method, store its details
    if (updatedIntent.payment_method) {
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(updatedIntent.payment_method);
        
        if (paymentMethod.billing_details) {
          payment.billingDetails = {
            address: paymentMethod.billing_details.address,
            phone: paymentMethod.billing_details.phone
          };
        }
      } catch (pmError) {
        console.error('Error retrieving payment method:', pmError);
      }
    }

    await payment.save();
    console.log('Payment record updated with status:', payment.status);

    res.status(200).json({
      success: true,
      status: payment.status,
      paymentId: payment._id,
      stripeStatus: updatedIntent.status,
      stripeDetails: {
        id: updatedIntent.id,
        amount: updatedIntent.amount / 100, // Convert from cents
        currency: updatedIntent.currency,
        status: updatedIntent.status
      }
    });
  } catch (error) {
    const { message, statusCode } = handleStripeError(error);
    
    res.status(statusCode).json({ 
      success: false, 
      message
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment intent ID is required' 
      });
    }

    // Find the payment in our database
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    // Get the latest status from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Update our record if status has changed
    if (
      (paymentIntent.status === 'succeeded' && payment.status !== 'completed') ||
      (paymentIntent.status === 'canceled' && payment.status !== 'failed')
    ) {
      payment.status = paymentIntent.status === 'succeeded' ? 'completed' : 'failed';
      await payment.save();
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        created: payment.created
      }
    });
  } catch (error) {
    const { message, statusCode } = handleStripeError(error);
    
    res.status(statusCode).json({ 
      success: false, 
      message
    });
  }
};

// Get payment by order ID
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found for this order' 
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        created: payment.created
      }
    });
  } catch (error) {
    console.error('Error getting payment by order ID:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error getting payment by order ID' 
    });
  }
}; 