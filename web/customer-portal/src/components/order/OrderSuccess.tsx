import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Dummy data
const dummyOrder = {
  id: 'ORD-12345',
  restaurantName: 'Tasty Bites',
  total: 39.65,
  estimatedDeliveryTime: '30-45 min',
};

const OrderSuccess: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-4">
        <CheckCircleIcon className="h-20 w-20 text-green-500" />
      </div>
      
      <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
      <p className="text-xl text-gray-600 mb-6">
        Thank you for your order. Your delicious food is on its way!
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Order Details</h3>
        <p className="text-gray-700 mb-1">Order Number: <span className="font-medium">{dummyOrder.id}</span></p>
        <p className="text-gray-700 mb-1">Restaurant: <span className="font-medium">{dummyOrder.restaurantName}</span></p>
        <p className="text-gray-700 mb-1">Total Amount: <span className="font-medium">${dummyOrder.total.toFixed(2)}</span></p>
        <p className="text-gray-700">Estimated Delivery Time: <span className="font-medium">{dummyOrder.estimatedDeliveryTime}</span></p>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600">
          We've sent a confirmation email with your order details.
          You can also track your order status in the "Orders" section.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/orders"
          className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Track Order
        </Link>
        <Link 
          to="/"
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess; 