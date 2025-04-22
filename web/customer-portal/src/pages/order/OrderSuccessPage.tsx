import React, { useEffect } from 'react';
import OrderSuccess from '../../components/order/OrderSuccess';

const OrderSuccessPage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <OrderSuccess />
    </div>
  );
};

export default OrderSuccessPage; 