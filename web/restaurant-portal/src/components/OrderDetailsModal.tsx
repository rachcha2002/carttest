import React, { useState } from 'react';
import { Order } from '../types/order.types';
import StatusUpdateDropdown from './StatusUpdateDropdown';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: string) => Promise<void>;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');
  
  if (!order) return null;

  const formatDatetime = (dateString: string | Date): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to get status badge colors
  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case "order-received":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "preparing-your-order":
        return "bg-[#f29f05]/10 text-[#f29f05] border-[#f29f05]/20";
      case "wrapping-up":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "picking-up":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "heading-your-way":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const handleStatusChange = (newStatus: string) => {
    if (onUpdateStatus && order) {
      onUpdateStatus(order.orderId, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with blur */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        {/* Modal position trick */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div 
          className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 focus:outline-none z-10"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#f29f05]/10 to-[#f29f05]/5 border-b border-[#f29f05]/10 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white h-14 w-14 rounded-xl border border-[#f29f05]/20 shadow-sm flex items-center justify-center">
                  <span className="text-[#f29f05] text-xl font-bold">{order.orderId.substring(4, 6)}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDatetime(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClasses(order.status)}`}>
                  {order.status.replace(/-/g, ' ')}
                </span>
                {onUpdateStatus && (
                  <div className="mt-2">
                    <StatusUpdateDropdown
                      currentStatus={order.status}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'details'
                    ? 'border-[#f29f05] text-[#f29f05]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Order Details
              </button>
              <button
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'timeline'
                    ? 'border-[#f29f05] text-[#f29f05]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('timeline')}
              >
                Order Timeline
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
            {activeTab === 'details' ? (
              <div className="space-y-6">
                {/* Summary Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Payment Status</span>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : order.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Payment Method</span>
                      <div className="mt-1 text-gray-900 font-medium text-sm">{order.paymentMethod}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Order Total</span>
                      <div className="mt-1 text-gray-900 font-bold text-lg">{formatCurrency(order.total)}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Order Items</span>
                      <div className="mt-1 text-gray-900 font-medium text-sm">{order.foods.length} items</div>
                    </div>
                  </div>
                </div>
              
                {/* Customer Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 flex items-center mb-3">
                    <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Information
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-4 flex items-center">
                      <div className="h-12 w-12 bg-[#f29f05]/10 rounded-full flex items-center justify-center">
                        <span className="text-[#f29f05] font-medium text-lg">{order.user.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="font-medium text-gray-900">{order.user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {order.user.phoneNumber || 'No phone number provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 flex items-center mb-3">
                    <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivery Information
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-4">
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Delivery Address</span>
                      <div className="mt-1 text-gray-900">{order.deliveryAddress}</div>
                    </div>
                    {order.deliveryInstructions && (
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Delivery Instructions</span>
                        <div className="mt-1 text-gray-600 text-sm">{order.deliveryInstructions}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order Items Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 flex items-center mb-3">
                    <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Order Items ({order.foods.length})
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {order.foods.map((item, index) => (
                        <li key={index} className="px-4 py-3 flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#f29f05]/10 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-[#f29f05] font-medium">{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 truncate">{item.description}</p>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Order Summary Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 flex items-center mb-3">
                    <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Order Summary
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.tax)}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="font-bold text-lg text-[#f29f05]">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-4">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {order.deliveryTimeline.map((event, eventIdx) => (
                        <li key={eventIdx}>
                          <div className="relative pb-8">
                            {eventIdx !== order.deliveryTimeline.length - 1 ? (
                              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                              <div className="relative">
                                <span className="h-10 w-10 rounded-full bg-[#f29f05] flex items-center justify-center ring-8 ring-white">
                                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 py-0">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-sm text-gray-900 font-medium">
                                    {event.description}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    {formatDatetime(event.time)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 