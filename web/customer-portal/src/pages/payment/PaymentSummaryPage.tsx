import React from 'react';
import PaymentSummary from '../../components/payment/PaymentSummary';

const PaymentSummaryPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Complete Payment</h1>
      <PaymentSummary />
    </div>
  );
};

export default PaymentSummaryPage; 