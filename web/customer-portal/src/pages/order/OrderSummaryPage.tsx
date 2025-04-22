import React from 'react';
import OrderSummary from '../../components/order/OrderSummary';

const OrderSummaryPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Review Your Order</h1>
      <OrderSummary />
    </div>
  );
};

export default OrderSummaryPage; 