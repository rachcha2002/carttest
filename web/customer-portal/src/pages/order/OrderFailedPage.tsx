import React, { useEffect } from 'react';
import OrderFailed from '../../components/order/OrderFailed';

const OrderFailedPage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <OrderFailed />
    </div>
  );
};

export default OrderFailedPage; 