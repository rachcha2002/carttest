import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Dummy data
const dummyPayment = {
  orderId: 'ORD-12345',
  transactionId: 'TXN-78901',
  amount: 39.65,
  paymentMethod: 'Credit Card',
  date: new Date().toLocaleString(),
  cardLast4: '4242',
};

const PaymentSuccess: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-4">
        <CheckCircleIcon className="h-20 w-20 text-green-500" />
      </div>
      
      <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
      <p className="text-xl text-gray-600 mb-6">
        Your payment has been processed successfully.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
          <p className="text-gray-700">Order Number:</p>
          <p className="font-medium">{dummyPayment.orderId}</p>
          
          <p className="text-gray-700">Transaction ID:</p>
          <p className="font-medium">{dummyPayment.transactionId}</p>
          
          <p className="text-gray-700">Amount Paid:</p>
          <p className="font-medium">${dummyPayment.amount.toFixed(2)}</p>
          
          <p className="text-gray-700">Payment Method:</p>
          <p className="font-medium">{dummyPayment.paymentMethod}</p>
          
          {dummyPayment.cardLast4 && (
            <>
              <p className="text-gray-700">Card Used:</p>
              <p className="font-medium">**** **** **** {dummyPayment.cardLast4}</p>
            </>
          )}
          
          <p className="text-gray-700">Date & Time:</p>
          <p className="font-medium">{dummyPayment.date}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600">
          A receipt has been sent to your email address.
          Track your order and get live updates in the "Orders" section.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/order/success"
          className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          View Order
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

export default PaymentSuccess; 