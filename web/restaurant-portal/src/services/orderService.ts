import axios from 'axios';

const ORDER_API_URL = process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:5003/api';

// Create axios instance
const orderApiClient = axios.create({
  baseURL: ORDER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for token
orderApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Order service functions
export const orderService = {
  // Get orders for a restaurant
  getRestaurantOrders: async (restaurantId: string) => {
    try {
      const response = await orderApiClient.get(`/orders/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    }
  },

  // Get a specific order details
  getOrderById: async (orderId: string) => {
    try {
      const response = await orderApiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string, description?: string) => {
    try {
      const response = await orderApiClient.patch(`/orders/${orderId}/status`, {
        status,
        description,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}; 