require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_RENAMED);

// Log the first part of the key to confirm it's being read
console.log('Starting Stripe connection test...');
if (!process.env.STRIPE_SECRET_KEY_RENAMED) {
  console.error('ERROR: STRIPE_SECRET_KEY_RENAMED is not defined in environment variables');
  console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
  process.exit(1);
}
console.log('Using API key starting with:', process.env.STRIPE_SECRET_KEY_RENAMED?.substring(0, 8) + '...');

async function testStripeConnection() {
  try {
    console.log('Starting Stripe connection test...');
    console.log('Using API key starting with:', process.env.STRIPE_SECRET_KEY_RENAMED?.substring(0, 8) + '...');
    
    // Using Stripe's predefined test token instead of creating one with raw card data
    const testToken = 'tok_visa'; // This is a predefined token for a test Visa card
    console.log('Using test token:', testToken);
    
    // Create a test customer
    const customer = await stripe.customers.create({
      email: 'test@cravecart.com',
      name: 'Test Customer',
      description: 'Test customer for API verification',
    });
    
    console.log('Created test customer:', customer.id);
    
    // Create a charge using the predefined token with LKR currency
    const charge = await stripe.charges.create({
      amount: 100000, // 1000 LKR (amount in cents/lowest currency unit)
      currency: 'lkr',
      source: testToken,
      description: 'Test charge in LKR',
      metadata: {
        order_id: 'TEST-LKR-' + Date.now()
      }
    });
    
    console.log('Test charge created successfully!');
    console.log('Charge ID:', charge.id);
    console.log('Status:', charge.status);
    console.log('Amount:', charge.amount / 100, charge.currency.toUpperCase());
    console.log('This charge should now appear in your Stripe dashboard.');
    
    // Create a PaymentIntent for testing that flow with LKR
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 150000, // 1500 LKR (amount in cents/lowest currency unit)
      currency: 'lkr',
      payment_method_types: ['card'],
      metadata: {
        integration_test: 'true',
        order_id: 'TEST-INTENT-LKR-' + Date.now()
      }
    });
    
    console.log('\nPayment Intent created:');
    console.log('ID:', paymentIntent.id);
    console.log('Client Secret:', paymentIntent.client_secret.substring(0, 10) + '...');
    
    // Confirm it directly with a test card
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: 'pm_card_visa', // Using predefined test payment method
    });
    
    console.log('\nPayment Intent confirmed:');
    console.log('Status:', confirmedIntent.status);
    console.log('Currency:', confirmedIntent.currency.toUpperCase());
    console.log('This payment intent should now appear in your Stripe dashboard.');
    
    return true;
  } catch (error) {
    console.error('Error testing Stripe connection:');
    console.error(error.message);
    if (error.type) {
      console.error('Error type:', error.type);
    }
    return false;
  }
}

// Run the test
testStripeConnection()
  .then(success => {
    if (success) {
      console.log('\nStripe integration test completed successfully!');
    } else {
      console.log('\nStripe integration test failed.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  }); 