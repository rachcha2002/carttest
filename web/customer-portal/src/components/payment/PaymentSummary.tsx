import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCart } from '../../hooks/useCart';
import paymentService from '../../services/paymentService';
import orderService from '../../services/orderService';

// Define options for CardElement with better styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#6366F1',
      padding: '16px',
      lineHeight: '1.5',
      fontSmoothing: 'antialiased',
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
  hidePostalCode: true
};

// This is where we'll display the payment form with Stripe components
const PaymentForm = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { items, totalAmount, clearCart } = useCart();

  // FIXED AMOUNT for all payments in LKR
  const FIXED_AMOUNT = 1000; // 1000 LKR - must be a number
  const FIXED_CURRENCY = 'lkr'; // Must be lowercase for Stripe

  // Create a payment intent once
  useEffect(() => {
    // Skip if already initialized or successful
    if (paymentInitialized || paymentSuccess) return;

    const orderFromState = location.state?.orderData;
    const randomOrderId = `ORD-${Math.floor(Math.random() * 100000)}`;
    
    // Create order data from cart or location state - ALWAYS USE FIXED AMOUNT
    const orderDetails = {
      orderId: orderFromState?.orderId || randomOrderId,
      amount: FIXED_AMOUNT, // Fixed amount of 1000 LKR
      currency: FIXED_CURRENCY,
      customerEmail: orderFromState?.customerEmail || localStorage.getItem('userEmail') || 'customer@example.com',
      customerName: orderFromState?.customerName || localStorage.getItem('userName') || 'Customer',
      items: items // Include items for display purposes only
    };
    
    console.log('Creating payment with fixed amount:', FIXED_AMOUNT, FIXED_CURRENCY);
    
    setOrderData(orderDetails);

    // Function to create a payment intent
    const createIntent = async () => {
      try {
        setIsProcessing(true);
        setPaymentError(null);
        // Mark as initialized immediately to prevent duplicate calls
        setPaymentInitialized(true);
        
        console.log('Creating payment intent with:', orderDetails);
        const result = await paymentService.createPaymentIntent(orderDetails);
        console.log('Payment intent created:', result);
        
        if (result && result.clientSecret) {
          setClientSecret(result.clientSecret);
          setPaymentIntentId(result.paymentIntentId);
          
          // If the server returns a message about using an existing intent, log it
          if (result.message) {
            console.log('Server message:', result.message);
          }
        } else {
          throw new Error(result.message || 'Invalid response from payment service');
        }
      } catch (error: any) {
        console.error('Failed to create payment intent:', error);
        
        // Check if it's a 409 conflict (another request in progress)
        if (error.response && error.response.status === 409) {
          console.log('Another payment request is in progress, retrying in 2 seconds...');
          
          // Reset the initialized flag and retry after a delay
          setTimeout(() => {
            setPaymentInitialized(false);
          }, 2000);
          
        } else {
          setPaymentError(error.message || 'Failed to initialize payment. Please try again.');
          setPaymentInitialized(false); // Reset if there was a non-conflict error
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Only create an intent if we haven't already done so
    if (!clientSecret && !paymentInitialized) {
      createIntent();
    }
    
  }, [location.state, navigate, paymentSuccess, paymentInitialized, clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Stripe has not been initialized yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Card element not found. Please refresh and try again.');
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentError(null);

      console.log('Confirming payment with secret:', clientSecret);
      
      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            address: {
              city: 'Colombo',
              country: 'LK',
              line1: '123 Main St',
              postal_code: '10000',
              state: 'Western Province'
            }
          }
        },
        return_url: window.location.origin + '/payment/success'  // Important for 3D Secure
      });

      console.log('Payment confirmation result:', result);

      if (result.error) {
        console.error('Payment error:', result.error);
        
        if (result.error.type === 'card_error') {
          // Update order payment status to 'failed' for card errors
          if (orderData.orderId) {
            try {
              console.log('Updating order payment status to failed for order:', orderData.orderId);
              orderService.updatePaymentStatus(orderData.orderId, 'failed')
                .then(result => console.log('Order payment status updated to failed:', result))
                .catch(error => console.error('Failed to update order payment status to failed:', error));
            } catch (error) {
              console.error('Error updating order payment status to failed:', error);
            }
          }
          
          // Handle card errors (like declined card)
          handlePaymentError(result.error.message || 'Your card was declined', false);
        } else {
          // Handle other types of errors
          handlePaymentError(result.error.message || 'An error occurred while processing your payment.', true);
        }
      } else if (result.paymentIntent?.status === 'succeeded') {
        console.log('Payment successful:', result.paymentIntent);
        
        try {
          // Confirm the payment in our backend
          const confirmation = await paymentService.confirmPayment(paymentIntentId);
          console.log('Payment confirmed with backend:', confirmation);
          
          // Mark payment as successful
          setPaymentSuccess(true);
          
          // Clear the cart after successful payment
          clearCart();
          
          // Update the order payment status to 'completed'
          if (orderData.orderId) {
            try {
              console.log('Updating order payment status to completed for order:', orderData.orderId);
              const orderUpdateResult = await orderService.updatePaymentStatus(orderData.orderId, 'completed');
              console.log('Order payment status updated successfully:', orderUpdateResult);
            } catch (orderUpdateError) {
              console.error('Failed to update order payment status:', orderUpdateError);
              // Continue with navigation even if order update fails - payment was successful
            }
          }
          
          // Navigate to success page
          navigate('/payment/success', { 
            state: { 
              orderData,
              paymentId: paymentIntentId
            } 
          });
        } catch (confirmError: any) {
          console.error('Backend confirmation error:', confirmError);
          handlePaymentError('Payment succeeded but we had trouble confirming it. Please contact support.');
        }
      } else if (result.paymentIntent?.status === 'requires_action') {
        // Handle 3D Secure authentication if required
        console.log('Payment requires 3D Secure authentication');
        setPaymentError('This payment requires additional authentication. Please complete the authentication process.');
      } else {
        // Handle other potential statuses
        console.log('Payment status:', result.paymentIntent?.status);
        handlePaymentError(`Payment status: ${result.paymentIntent?.status}. Please try again.`);
      }
    } catch (err: any) {
      console.error('Payment confirmation error:', err);
      handlePaymentError(err.message || 'An error occurred while processing your payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment errors - can either show inline or navigate to error page
  const handlePaymentError = (errorMessage: string, navigateAway = false) => {
    // Always set the error message
    setPaymentError(errorMessage);
    
    // Update order payment status to 'failed' for serious errors
    if (navigateAway && orderData?.orderId) {
      try {
        console.log('Updating order payment status to failed for order:', orderData.orderId);
        orderService.updatePaymentStatus(orderData.orderId, 'failed')
          .then(result => console.log('Order payment status updated to failed:', result))
          .catch(error => console.error('Failed to update order payment status to failed:', error));
      } catch (error) {
        console.error('Error updating order payment status to failed:', error);
      }
    }
    
    // For serious errors, navigate to the failed payment page
    if (navigateAway) {
      navigate('/payment/failed', {
        state: {
          error: errorMessage,
          orderId: orderData?.orderId
        }
      });
    }
    // Otherwise the error will be displayed inline
  };

  // Display amounts in LKR format
  const formatLKR = (amount: number) => {
    return `${amount.toFixed(2)} LKR`;
  };

  // For displaying order items (convert USD to LKR for display)
  const displayItemPrice = (priceUSD: number, quantity: number) => {
    // Simple conversion for display purposes
    const priceLKR = Math.round(priceUSD * 300 * quantity); // Approximate USD to LKR conversion
    return formatLKR(priceLKR);
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Order Summary</h2>
        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs font-medium px-2 py-1 rounded-full">{item.quantity}x</span>
                <span className="dark:text-gray-300">{item.name}</span>
              </div>
              <span className="dark:text-white font-medium">{displayItemPrice(item.price, item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="dark:text-white">{formatLKR(totalAmount * 300)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
            <span className="dark:text-white">{formatLKR(totalAmount * 0.08 * 300)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
            <span className="dark:text-white">{formatLKR(300)}</span>
          </div>
          <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-lg">
            <span className="dark:text-white">Total</span>
            <span className="text-primary-600 dark:text-primary-400">
              {formatLKR(FIXED_AMOUNT)}
            </span>
            </div>
          <div className="pt-2 text-xs text-right text-gray-500 dark:text-gray-400">
            <span>* Fixed price checkout: {formatLKR(FIXED_AMOUNT)}</span>
          </div>
        </div>
            </div>
            
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Card Details
          </label>
          <div className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-700 shadow-inner transition-all hover:border-primary-500 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          {paymentError && (
            <div className="text-red-500 text-sm mt-3 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {paymentError}
            </div>
          )}
              </div>
              
        <button
          type="submit"
          disabled={!stripe || isProcessing || !clientSecret || paymentSuccess}
          className={`w-full py-4 px-6 bg-primary-600 text-white rounded-lg font-semibold text-base transition-all shadow-lg shadow-primary-600/20
                    ${(!stripe || isProcessing || !clientSecret || paymentSuccess) 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:bg-primary-700 hover:shadow-primary-700/30'}`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : paymentSuccess ? (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Payment Successful
              </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay {formatLKR(FIXED_AMOUNT)}
            </div>
          )}
            </button>
          </form>
    </div>
  );
};

// The main component that wraps the Stripe Elements provider
const PaymentSummary = () => {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Stripe with publishable key from API
    const loadStripeInstance = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Get the publishable key from our payment service
        const stripeConfig = await paymentService.getStripeConfig();
        
        if (!stripeConfig || !stripeConfig.publishableKey) {
          throw new Error('No publishable key returned from server');
        }
        
        console.log('Loading Stripe with key:', stripeConfig.publishableKey.substring(0, 10) + '...');
        const stripeInstance = await loadStripe(stripeConfig.publishableKey);
        
        if (!stripeInstance) {
          throw new Error('Failed to initialize Stripe');
        }
        
        setStripePromise(stripeInstance);
      } catch (error: any) {
        console.error('Error loading Stripe:', error);
        
        // Try hardcoded key as fallback (this is only for development)
        try {
          console.log('Attempting to load Stripe with hardcoded key');
          const hardcodedKey = 'pk_test_51RFf3THsCzKYEOA9CjWeShqLww38lou7qbkfI4Z4hJpsuvB36qyNwje4y6qHyuPISY0emyW21kJVImnQojYSDYvp00kDL5H1mu';
          const stripeInstance = await loadStripe(hardcodedKey);
          
          if (stripeInstance) {
            console.log('Loaded Stripe with hardcoded key');
            setStripePromise(stripeInstance);
            setLoadError(null);
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback loading also failed:', fallbackError);
        }
        
        setLoadError('Could not connect to payment processor. Make sure the payment service is running.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStripeInstance();
  }, []);

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
        <p className="text-red-600 dark:text-red-400 font-medium mb-4">
          {loadError}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Please try refreshing the page or contact customer support.
        </p>
      </div>
    );
  }

  if (isLoading || !stripePromise) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600/30 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950/50 py-8 px-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary-800 dark:text-primary-300">Payment Information</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              Your payment is secured with industry-standard encryption. All information is transmitted securely via SSL.
            </p>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                <strong>Test Mode:</strong> Use card number <span className="font-mono bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-400 px-2 py-1 rounded">4242 4242 4242 4242</span> with any future expiration date and any 3-digit CVV.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-3 shadow-md">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                  alt="Stripe" className="h-8 dark:hidden" />
              <img src="https://www.vectorlogo.zone/logos/stripe/stripe-ar21.svg" 
                  alt="Stripe" className="h-8 hidden dark:block" />
            </div>
          </div>
        </div>
      </div>
      
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
};

export default PaymentSummary; 