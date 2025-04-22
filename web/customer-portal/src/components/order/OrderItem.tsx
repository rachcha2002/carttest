import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, TruckIcon, CheckCircleIcon, SparklesIcon, ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export interface OrderItemProps {
  id: string;
  restaurantName: string;
  date: string;
  total: number;
  status: 'order-received' | 'preparing-your-order' | 'wrapping-up' | 'picking-up' | 'heading-your-way' | 'delivered' | 'cancelled';
  items: string[];
  estimatedDeliveryTime?: string;
}

const OrderItem: React.FC<OrderItemProps> = ({
  id,
  restaurantName,
  date,
  total,
  status,
  items,
  estimatedDeliveryTime,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'order-received':
        return 'bg-blue-100 text-blue-800';
      case 'preparing-your-order':
        return 'bg-yellow-100 text-yellow-800';
      case 'wrapping-up':
        return 'bg-indigo-100 text-indigo-800';
      case 'picking-up':
        return 'bg-purple-100 text-purple-800';
      case 'heading-your-way':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBorderColor = () => {
    if (status === 'delivered') return 'border-green-200';
    if (status === 'cancelled') return 'border-red-200';
    return 'border-blue-200';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'order-received':
        return <ClockIcon className="h-5 w-5 mr-1" />;
      case 'preparing-your-order':
        return <SparklesIcon className="h-5 w-5 mr-1" />;
      case 'wrapping-up':
        return <ShoppingBagIcon className="h-5 w-5 mr-1" />;
      case 'picking-up':
        return <ShoppingBagIcon className="h-5 w-5 mr-1" />;
      case 'heading-your-way':
        return <TruckIcon className="h-5 w-5 mr-1" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'order-received':
        return 'Order Received';
      case 'preparing-your-order':
        return 'Preparing Your Order';
      case 'wrapping-up':
        return 'Wrapping Up';
      case 'picking-up':
        return 'Picking Up';
      case 'heading-your-way':
        return 'Heading Your Way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  // Get restaurant initial for the logo placeholder
  const getRestaurantInitial = () => {
    if (!restaurantName) return '?';
    return restaurantName.charAt(0).toUpperCase();
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
    const index = restaurantName.length % colors.length;
    return colors[index];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border ${getBorderColor()} transition-all hover:shadow-lg`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 ${getRestaurantColor()}`}>
              {getRestaurantInitial()}
            </div>
            <div>
              <h3 className="text-lg font-semibold dark:text-white mb-1">{restaurantName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-semibold text-lg dark:text-white">${total.toFixed(2)}</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="mb-5 border-t border-b border-gray-100 dark:border-gray-700 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium dark:text-gray-300">Items:</span> {items.join(', ')}
          </p>
          {estimatedDeliveryTime && status !== 'delivered' && status !== 'cancelled' && (
            <div className="flex items-center mt-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
              <ClockIcon className="h-4 w-4 mr-2" />
              <span>Estimated delivery: <span className="font-semibold">{estimatedDeliveryTime}</span></span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Order ID: {id}
          </p>
          <Link 
            to={`/orders/${id}`} 
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Details
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderItem; 