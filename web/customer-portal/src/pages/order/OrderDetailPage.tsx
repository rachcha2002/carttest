import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon, 
  TruckIcon, 
  ChatBubbleLeftIcon, 
  CreditCardIcon
} from '@heroicons/react/24/outline';

// This would typically come from an API call
// For now, we'll display some dummy data
const dummyOrderDetails = {
  id: 'ORD-12345',
  restaurantName: 'Tasty Bites',
  restaurantAddress: '789 Oak Street, New York, NY 10002',
  restaurantPhone: '+1 (555) 987-6543',
  date: 'June 15, 2023 - 7:30 PM',
  status: 'delivered',
  items: [
    { name: 'Margherita Pizza', quantity: 1, price: 12.99, notes: 'Extra cheese' },
    { name: 'Garlic Bread', quantity: 1, price: 4.99, notes: '' },
    { name: 'Coca-Cola', quantity: 2, price: 2.99, notes: 'No ice' },
  ],
  subtotal: 23.96,
  deliveryFee: 3.99,
  tax: 2.40,
  total: 30.35,
  paymentMethod: 'Credit Card (•••• 4242)',
  deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
  deliveryInstructions: 'Please leave at the door',
  driver: {
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    vehicleInfo: 'Honda Civic (Black) - XYZ 123'
  },
  deliveryTimeline: [
    { status: 'Order Received', time: '7:30 PM', description: 'Your order has been received by the restaurant.' },
    { status: 'Preparing Your Order', time: '7:35 PM', description: 'The restaurant is preparing your delicious food.' },
    { status: 'Wrapping Up', time: '7:45 PM', description: 'Your food is being packaged for delivery.' },
    { status: 'Picking Up', time: '8:00 PM', description: 'Driver is at the restaurant to pick up your order.' },
    { status: 'Heading Your Way', time: '8:15 PM', description: 'Your order is on the way to your location.' },
    { status: 'Delivered', time: '8:45 PM', description: 'Your order has been delivered. Enjoy your meal!' },
  ],
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');
  
  // In a real app, you would fetch the order details based on the id
  const orderDetails = dummyOrderDetails;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Received':
        return 'bg-blue-100 text-blue-800';
      case 'Preparing Your Order':
        return 'bg-yellow-100 text-yellow-800';
      case 'Wrapping Up':
        return 'bg-indigo-100 text-indigo-800';
      case 'Picking Up':
        return 'bg-purple-100 text-purple-800';
      case 'Heading Your Way':
        return 'bg-orange-100 text-orange-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get restaurant initial for the logo placeholder
  const getRestaurantInitial = () => {
    if (!orderDetails.restaurantName) return '?';
    return orderDetails.restaurantName.charAt(0).toUpperCase();
  };

  // Generate a background color based on restaurant name
  const getRestaurantColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    const index = orderDetails.restaurantName.length % colors.length;
    return colors[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/orders" className="flex items-center text-primary hover:text-primary-dark">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold mr-4 ${getRestaurantColor()}`}>
              {getRestaurantInitial()}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{orderDetails.restaurantName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{orderDetails.date}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status === 'delivered' ? 'Delivered' : 'Order Received')}`}>
                  {orderDetails.status === 'delivered' ? 'Delivered' : 'Order Received'}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Order #{orderDetails.id}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-6 font-medium ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Order Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-6 font-medium ${
              activeTab === 'timeline'
                ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Delivery Timeline
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'details' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Items Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Order Items</h3>
              <div className="space-y-4">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-start mb-2 sm:mb-0">
                      <span className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 w-8 h-8 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 mr-3">
                        {item.quantity}
                      </span>
                      <div>
                        <p className="font-medium dark:text-white">{item.name}</p>
                        {item.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="italic">Note: {item.notes}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-medium dark:text-white self-end sm:self-center">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="dark:text-white">${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="dark:text-white">${orderDetails.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="dark:text-white">${orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">${orderDetails.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  <span>Paid with {orderDetails.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Delivery Information</h3>
              <div className="space-y-4">
                <div className="flex">
                  <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Delivery Address</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.deliveryAddress}</p>
                  </div>
                </div>
                {orderDetails.deliveryInstructions && (
                  <div className="flex">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium dark:text-white">Delivery Instructions</p>
                      <p className="text-gray-600 dark:text-gray-400">{orderDetails.deliveryInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Restaurant Information */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Restaurant Information</h3>
              <div className="space-y-4">
                <div className="flex">
                  <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Address</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.restaurantAddress}</p>
                  </div>
                </div>
                <div className="flex">
                  <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Phone</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.restaurantPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Delivery Driver</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">{orderDetails.driver.name}</p>
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star}
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 ${star <= orderDetails.driver.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">{orderDetails.driver.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <TruckIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Vehicle Information</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.driver.vehicleInfo}</p>
                  </div>
                </div>
                <div className="flex">
                  <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Phone</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.driver.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6 dark:text-white">Delivery Timeline</h3>
            <div className="space-y-8">
              {orderDetails.deliveryTimeline.map((stage, index) => (
                <div key={index} className="flex">
                  <div className="relative mr-6">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${index === orderDetails.deliveryTimeline.length - 1 ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {index === orderDetails.deliveryTimeline.length - 1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    {index < orderDetails.deliveryTimeline.length - 1 && (
                      <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700 absolute top-6 left-1/2 transform -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-lg dark:text-white">{stage.status}</h4>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                        {stage.time}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderDetailPage; 