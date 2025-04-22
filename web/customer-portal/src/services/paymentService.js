import axios from 'axios';

const API_URL = 'http://localhost:5002/api/payments';

// Helper for better error handling
const handleApiError = (error, customMessage) => {
  // Check if it's a 409 conflict error (duplicate request)
  if (error.response && error.response.status === 409) {
    console.log('Duplicate payment request:', error.response.data);
    throw error; // Return the error directly so we can check the status code
  }
  
  // First check for custom Stripe errors in the response
  if (error.response && error.response.data) {
    console.error(`${customMessage}:`, error.response.data);
    
    if (error.response.data.message) {
      throw new Error(error.response.data.message);
    }
  }
  
  // If no specific error found, throw the original error
  console.error(customMessage, error);
  throw error;
};

const paymentService = {
  // Get Stripe publishable key
  getStripeConfig: async () => {
    try {
      const response = await axios.get(`${API_URL}/stripe-config`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error getting Stripe config');
    }
  },

  // Create a payment intent
  createPaymentIntent: async (orderData) => {
    try {
      console.log('Sending payment intent request with data:', orderData);
      const response = await axios.post(`${API_URL}/create-payment-intent`, orderData);
      console.log('Payment intent created successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error creating payment intent');
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId) => {
    try {
      console.log('Confirming payment intent:', paymentIntentId);
      const response = await axios.post(`${API_URL}/confirm-payment`, { paymentIntentId });
      console.log('Payment confirmed successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error confirming payment');
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentIntentId) => {
    try {
      const response = await axios.get(`${API_URL}/status/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error getting payment status');
    }
  },

  // Get payment by order ID
  getPaymentByOrderId: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/order/${orderId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error getting payment by order ID');
    }
  }
};

export default paymentService; 