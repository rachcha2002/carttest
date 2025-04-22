import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const { orderData, paymentId } = location.state || {};

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your order has been placed successfully and a confirmation has been sent to your email.
        </p>
        
        {orderData && (
          <div className="mb-6 text-left border-t border-b border-gray-200 dark:border-gray-700 py-4">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">Order Details</h2>
            <p className="text-gray-600 dark:text-gray-400">Order ID: {orderData.orderId}</p>
            <p className="text-gray-600 dark:text-gray-400">Amount: {orderData.amount.toFixed(2)} {orderData.currency}</p>
            {paymentId && <p className="text-gray-600 dark:text-gray-400">Payment ID: {paymentId}</p>}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 