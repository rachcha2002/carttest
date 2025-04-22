import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

// Dummy data
const dummyPayment = {
  orderId: 'ORD-12345',
  amount: 39.65,
  errorCode: 'ERR-5001',
  errorMessage: 'Card declined by issuer. Please try a different payment method or contact your bank.',
};

const PaymentFailed: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-4">
        <ExclamationCircleIcon className="h-20 w-20 text-red-500" />
      </div>
      
      <h2 className="text-3xl font-bold mb-2">Payment Failed</h2>
      <p className="text-xl text-gray-600 mb-6">
        We were unable to process your payment.
      </p>
      
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2 text-red-700">Payment Details</h3>
        <div className="text-left mb-4">
          <p className="text-gray-700 mb-1">Order Number: <span className="font-medium">{dummyPayment.orderId}</span></p>
          <p className="text-gray-700 mb-1">Amount: <span className="font-medium">${dummyPayment.amount.toFixed(2)}</span></p>
        </div>
        
        <div className="text-left">
          <h4 className="text-md font-semibold mb-1 text-red-700">Error Information</h4>
          <p className="text-gray-700 mb-1">Error Code: <span className="font-medium">{dummyPayment.errorCode}</span></p>
          <p className="text-gray-700">{dummyPayment.errorMessage}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600">
          Please try again with a different payment method or contact your bank for assistance.
          If you continue to experience issues, please contact our customer support.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/payment"
          className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Try Again
        </Link>
        <Link 
          to="/order/summary"
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          Back to Order
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed; 