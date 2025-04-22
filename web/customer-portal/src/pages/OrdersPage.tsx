import React from 'react';
import { motion } from 'framer-motion';
import OrderItem, { OrderItemProps } from '../components/order/OrderItem';

// Dummy data for orders
const dummyOrders: OrderItemProps[] = [
  {
    id: 'ORD-12345',
    restaurantName: 'Tasty Bites',
    date: 'June 15, 2023 - 7:30 PM',
    total: 30.35,
    status: 'delivered',
    items: ['Margherita Pizza', 'Garlic Bread', 'Coca-Cola (2)'],
  },
  {
    id: 'ORD-12346',
    restaurantName: 'Burger Palace',
    date: 'June 12, 2023 - 12:45 PM',
    total: 25.80,
    status: 'delivered',
    items: ['Double Cheeseburger', 'French Fries', 'Chocolate Milkshake'],
  },
  {
    id: 'ORD-12347',
    restaurantName: 'Sushi Express',
    date: 'June 10, 2023 - 8:15 PM',
    total: 42.50,
    status: 'delivered',
    items: ['California Roll (8 pcs)', 'Spicy Tuna Roll (6 pcs)', 'Miso Soup', 'Green Tea'],
  },
  {
    id: 'ORD-12348',
    restaurantName: 'Taco Haven',
    date: 'Today - 1:30 PM',
    total: 18.75,
    status: 'heading-your-way',
    items: ['Beef Tacos (3)', 'Guacamole', 'Chips & Salsa'],
    estimatedDeliveryTime: '25-35 min',
  },
  {
    id: 'ORD-12349',
    restaurantName: 'Pizza Paradise',
    date: 'Today - 12:15 PM',
    total: 35.90,
    status: 'preparing-your-order',
    items: ['Pepperoni Pizza (Large)', 'Chicken Wings (8 pcs)', 'Garden Salad', 'Sprite'],
    estimatedDeliveryTime: '40-50 min',
  },
  {
    id: 'ORD-12350',
    restaurantName: 'Burger Barn',
    date: 'Today - 11:45 AM',
    total: 27.50,
    status: 'order-received',
    items: ['Deluxe Burger', 'Onion Rings', 'Root Beer'],
    estimatedDeliveryTime: '50-60 min',
  },
  {
    id: 'ORD-12351',
    restaurantName: 'Italian Bistro',
    date: 'Today - 12:30 PM',
    total: 42.75,
    status: 'wrapping-up',
    items: ['Fettuccine Alfredo', 'Bruschetta', 'Tiramisu'],
    estimatedDeliveryTime: '35-45 min',
  },
  {
    id: 'ORD-12352',
    restaurantName: 'Pho Delicious',
    date: 'Today - 12:20 PM',
    total: 31.25,
    status: 'picking-up',
    items: ['Beef Pho', 'Spring Rolls', 'Vietnamese Coffee'],
    estimatedDeliveryTime: '30-40 min',
  },
];

// Separate the active orders from past orders
const activeOrders = dummyOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
const pastOrders = dummyOrders.filter(order => order.status === 'delivered' || order.status === 'cancelled');

const OrdersPage: React.FC = () => {
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

      {dummyOrders.length === 0 && (
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