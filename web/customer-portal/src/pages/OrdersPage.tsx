import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import OrderItem, { OrderItemProps } from '../components/order/OrderItem';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import { toast } from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderItemProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await orderService.getUserOrders();
        
        if (response.success) {
          const formattedOrders: OrderItemProps[] = response.data.map((order: any) => ({
            id: order.orderId,
            restaurantName: order.restaurant?.restaurantInfo?.restaurantName || 'Unknown Restaurant',
            date: new Date(order.createdAt).toLocaleString(),
            total: order.total,
            status: order.status,
            items: order.foods.map((food: any) => `${food.name} (${food.quantity})`),
            estimatedDeliveryTime: order.status !== 'delivered' && order.status !== 'cancelled' 
              ? '30-45 min' 
              : undefined,
          }));
          
          setOrders(formattedOrders);
        } else {
          setError('Failed to fetch orders');
          toast.error('Failed to fetch your orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Error fetching orders');
        toast.error('Error loading your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  // Separate the active orders from past orders
  const activeOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  const pastOrders = orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white mb-2">My Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your current and past orders</p>
      </div>

      {activeOrders.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold dark:text-white">Active Orders</h2>
          </div>
          
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <OrderItem key={order.id} {...order} />
            ))}
          </div>
        </section>
      )}

      {pastOrders.length > 0 && (
        <section>
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold dark:text-white">Order History</h2>
          </div>
          
          <div className="space-y-4">
            {pastOrders.map((order) => (
              <OrderItem key={order.id} {...order} />
            ))}
          </div>
        </section>
      )}

      {orders.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10 text-center">
          <div className="mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 dark:text-white">No Orders Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't placed any orders yet. Browse restaurants and place your first order!
          </p>
          <a 
            href="/" 
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Browse Restaurants
          </a>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersPage; 