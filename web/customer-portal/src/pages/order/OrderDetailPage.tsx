import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon, 
  TruckIcon, 
  ChatBubbleLeftIcon, 
  CreditCardIcon
} from '@heroicons/react/24/outline';
import orderService from '../../services/orderService';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface DeliveryTimelineItem {
  status: string;
  time: string;
  description: string;
}

interface OrderDetails {
  id: string;
  orderId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  date: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
    vehicleInfo: string;
  };
  deliveryTimeline: DeliveryTimelineItem[];
  createdAt: string;
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, notifications } = useNotifications();
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  
  useEffect(() => {
    if (!socket) return;
    
    setSocketConnected(socket.connected);
    
    const handleConnect = () => {
      setSocketConnected(true);
    };
    
    const handleDisconnect = () => {
      setSocketConnected(false);
    };
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);
  
  useEffect(() => {
    if (!socket || !id) return;
    
    const handleOrderStatusUpdate = (data: any) => {
      if (data.orderId === id) {
        fetchOrderDetails(id);
      }
    };
    
    socket.on('order-status-update', handleOrderStatusUpdate);
    
    return () => {
      socket.off('order-status-update', handleOrderStatusUpdate);
    };
  }, [socket, id]);
  
  const fetchOrderDetails = async (orderId: string) => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.getOrder(orderId);
      
      if (response.success && response.data) {
        const orderData = response.data;
        
        const formattedOrder: OrderDetails = {
          id: orderData._id,
          orderId: orderData.orderId,
          restaurantName: orderData.restaurant?.restaurantInfo?.restaurantName || 'Unknown Restaurant',
          restaurantAddress: orderData.restaurant?.address || 'Address not available',
          restaurantPhone: orderData.restaurant?.phoneNumber || 'Phone not available',
          date: new Date(orderData.createdAt).toLocaleString(),
          status: orderData.status,
          items: orderData.foods.map((food: any) => ({
            name: food.name,
            quantity: food.quantity,
            price: food.price,
            notes: food.notes || ''
          })),
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          tax: orderData.tax,
          total: orderData.total,
          paymentMethod: `${orderData.paymentMethod || 'Card'} (${orderData.paymentId})`,
          deliveryAddress: orderData.deliveryAddress || 'Address not available',
          deliveryInstructions: orderData.deliveryInstructions || 'No specific instructions',
          driver: orderData.driver ? {
            name: orderData.driver.name || 'Not assigned yet',
            phone: orderData.driver.phoneNumber || 'Not available',
            rating: orderData.driver.rating || 0,
            vehicleInfo: orderData.driver.vehicleInfo || 'Not available'
          } : undefined,
          deliveryTimeline: orderData.deliveryTimeline.map((item: any) => ({
            status: formatStatus(item.status),
            time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: item.description
          })),
          createdAt: orderData.createdAt
        };
        
        setOrderDetails(formattedOrder);
      } else {
        setError('Failed to fetch order details');
        toast.error('Failed to load order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Error loading order details');
      toast.error('Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails(id || '');
  }, [id]);

  const formatStatus = (status: string): string => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order received':
        return 'bg-blue-100 text-blue-800';
      case 'preparing your order':
        return 'bg-yellow-100 text-yellow-800';
      case 'wrapping up':
        return 'bg-indigo-100 text-indigo-800';
      case 'picking up':
        return 'bg-purple-100 text-purple-800';
      case 'heading your way':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRestaurantInitial = () => {
    if (!orderDetails?.restaurantName) return '?';
    return orderDetails.restaurantName.charAt(0).toUpperCase();
  };

  const getRestaurantColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    if (!orderDetails?.restaurantName) return colors[0];
    const index = orderDetails.restaurantName.length % colors.length;
    return colors[index];
  };

  const StatusIndicator = () => (
    <div className="mb-4 flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {socketConnected ? 'Live updates active' : 'Offline mode'}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load order details'}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/orders" className="flex items-center text-primary hover:text-primary-dark">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold mr-4 ${getRestaurantColor()}`}>
              {getRestaurantInitial()}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{orderDetails.restaurantName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{orderDetails.date}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formatStatus(orderDetails.status))}`}>
                  {formatStatus(orderDetails.status)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Order #{orderDetails.orderId}</p>
              <StatusIndicator />
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-6 font-medium ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Order Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-6 font-medium ${
              activeTab === 'timeline'
                ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Delivery Timeline
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Order Items</h3>
              <div className="space-y-4">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-start mb-2 sm:mb-0">
                      <span className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 w-8 h-8 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 mr-3">
                        {item.quantity}
                      </span>
                      <div>
                        <p className="font-medium dark:text-white">{item.name}</p>
                        {item.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="italic">Note: {item.notes}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-medium dark:text-white self-end sm:self-center">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="dark:text-white">${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="dark:text-white">${orderDetails.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="dark:text-white">${orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">${orderDetails.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  <span>Paid with {orderDetails.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Delivery Information</h3>
              <div className="space-y-4">
                <div className="flex">
                  <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Delivery Address</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.deliveryAddress}</p>
                  </div>
                </div>
                {orderDetails.deliveryInstructions && (
                  <div className="flex">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium dark:text-white">Delivery Instructions</p>
                      <p className="text-gray-600 dark:text-gray-400">{orderDetails.deliveryInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Restaurant Information</h3>
              <div className="space-y-4">
                <div className="flex">
                  <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Address</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.restaurantAddress}</p>
                  </div>
                </div>
                <div className="flex">
                  <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">Phone</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderDetails.restaurantPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {orderDetails.driver && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Driver Information</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium dark:text-blue-300">{orderDetails.driver.name}</p>
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                        <span className="mr-2">Rating: {orderDetails.driver.rating}</span>
                        <span>{orderDetails.driver.vehicleInfo}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`tel:${orderDetails.driver.phone}`}
                    className="flex items-center justify-center mt-2 py-2 w-full bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Driver
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="relative">
              {orderDetails.deliveryTimeline.map((item, index) => (
                <div key={index} className="mb-8 flex last:mb-0">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                      index === orderDetails.deliveryTimeline.length - 1
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-100 text-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < orderDetails.deliveryTimeline.length - 1 && (
                      <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    )}
                  </div>
                  <div className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex-1 ${
                    index === orderDetails.deliveryTimeline.length - 1 ? 'border-l-4 border-green-500' : ''
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium dark:text-white">{item.status}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {item.time}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderDetailPage; 