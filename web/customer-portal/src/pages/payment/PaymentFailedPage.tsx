import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/solid';

const PaymentFailedPage: React.FC = () => {
  const location = useLocation();
  const { error } = location.state || { error: 'An unknown error occurred during payment processing.' };

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="flex justify-center mb-4">
          <XCircleIcon className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Payment Failed</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Unfortunately, your payment could not be processed.
        </p>
        
        <div className="mb-6 text-left p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-400">Error Details</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/payment"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </Link>
          <Link
            to="/order/cart"
            className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage; 