import axios from 'axios';

const ORDER_API_URL = process.env.REACT_APP_ORDER_API_URL || 'http://localhost:5003/api/orders';

// Helper for better error handling
const handleApiError = (error: any, customMessage: string) => {
  if (error.response && error.response.data) {
    console.error(`${customMessage}:`, error.response.data);
    
    if (error.response.data.message) {
      throw new Error(error.response.data.message);
    }
  }
  
  console.error(customMessage, error);
  throw error;
};

const orderService = {
  // Create a new order
  createOrder: async (orderData: any) => {
    try {
      console.log('Creating order with data:', orderData);
      const response = await axios.post(ORDER_API_URL, orderData);
      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error creating order');
    }
  },

  // Get order by ID
  getOrder: async (orderId: string) => {
    try {
      const response = await axios.get(`${ORDER_API_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error fetching order');
    }
  },

  // Get orders for current user
  getUserOrders: async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Get user ID from the token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
      
      const response = await axios.get(`${ORDER_API_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error fetching user orders');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await axios.patch(`${ORDER_API_URL}/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error updating order status');
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderId: string, paymentStatus: string) => {
    try {
      console.log(`Updating payment status for order ${orderId} to ${paymentStatus}`);
      const response = await axios.patch(`${ORDER_API_URL}/${orderId}/payment`, { paymentStatus });
      console.log('Payment status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error updating payment status');
    }
  }
};

export default orderService; 