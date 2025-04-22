import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

const OrderFailed: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-4">
        <ExclamationCircleIcon className="h-20 w-20 text-red-500" />
      </div>
      
      <h2 className="text-3xl font-bold mb-2">Order Failed</h2>
      <p className="text-xl text-gray-600 mb-6">
        We're sorry, but there was an issue processing your order.
      </p>
      
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2 text-red-700">What went wrong?</h3>
        <p className="text-gray-700 mb-4">
          There was an issue with your payment method. Please check your payment details and try again.
        </p>
        <p className="text-gray-700">
          If you continue to experience issues, please contact our customer support.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/order/summary"
          className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Try Again
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

export default OrderFailed; 