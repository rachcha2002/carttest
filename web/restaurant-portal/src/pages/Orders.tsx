import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { orderService } from "../services/orderService";
import { playNotificationSound } from "../utils/SoundUtils";
import { Order } from "../types/order.types";
import OrderDetailsModal from "../components/OrderDetailsModal";
import StatusUpdateDropdown from "../components/StatusUpdateDropdown";

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { socket, notifications } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const fetchOrders = async () => {
    if (!user || !user._id) return;
    
    try {
      setLoading(true);
      const response = await orderService.getRestaurantOrders(user._id);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Track socket connection status
  useEffect(() => {
    if (!socket) return;
    
    setSocketConnected(socket.connected);
    
    const handleConnect = () => {
      setSocketConnected(true);
      // Refresh orders when socket reconnects
      fetchOrders();
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

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket) return;

    // Handle new order notifications
    const handleNewOrder = (data: any) => {
      if (data.orderData && data.orderData.restaurant && data.orderData.restaurant._id === user?._id) {
        // Add the new order to the state
        setOrders(prev => [data.orderData, ...prev]);
        
        // Show alert and play sound
        setNewOrderAlert(`New order received: #${data.orderId}`);
        
        // Clear the alert after 5 seconds
        setTimeout(() => {
          setNewOrderAlert(null);
        }, 5000);
        
        // Play notification sound
        playNotificationSound();
      }
    };

    // Handle order status updates
    const handleOrderStatusUpdate = (data: any) => {
      if (data.orderData && data.orderData.restaurant && data.orderData.restaurant._id === user?._id) {
        // Update the order in the state
        setOrders(prev => 
          prev.map(order => order.orderId === data.orderId ? data.orderData : order)
        );
        
        // If the selected order in modal is being updated, update it too
        if (selectedOrder && selectedOrder.orderId === data.orderId) {
          setSelectedOrder(data.orderData);
        }
      }
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-status-update', handleOrderStatusUpdate);

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-status-update', handleOrderStatusUpdate);
    };
  }, [socket, user, selectedOrder]);

  // Check notifications for new orders
  useEffect(() => {
    // When a new notification arrives, refresh the orders
    // This is a fallback in case socket event didn't update the state directly
    const orderNotifications = notifications.filter(
      n => n.type === 'new-order' || n.type === 'order-status-update'
    );
    
    if (orderNotifications.length > 0) {
      fetchOrders();
    }
  }, [notifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const description = `Order status updated to ${newStatus}`;
      await orderService.updateOrderStatus(orderId, newStatus, description);
      
      // Update local state after successful API call
      setOrders(orders.map(order => 
        order.orderId === orderId ? { ...order, status: newStatus } : order
      ));

      // If the selected order in modal is being updated, update it too
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus
        });
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  const formatDatetime = (dateString: string | Date): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "order-received":
        return "bg-yellow-100 text-yellow-800";
      case "preparing-your-order":
        return "bg-[#f29f05]/10 text-[#f29f05]";
      case "wrapping-up":
        return "bg-blue-100 text-blue-800";
      case "picking-up":
        return "bg-purple-100 text-purple-800";
      case "heading-your-way":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-8">
        <div className="w-16 h-16 border-t-4 border-b-4 border-[#f29f05] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f29f05] hover:bg-[#f29f05]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Order Alert */}
      {newOrderAlert && (
        <div className="animate-pulse fixed top-5 right-5 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded shadow-lg z-50 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{newOrderAlert}</span>
        </div>
      )}

      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg className="w-8 h-8 mr-3 text-[#f29f05]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Orders
            </h1>
            <p className="mt-2 text-gray-600">
              Track and manage all incoming orders in real-time.
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
            {!socketConnected && (
              <div className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Offline Mode
              </div>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2 transition-all duration-300"
              disabled={refreshing}
            >
              <svg 
                className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-r from-[#f29f05]/5 to-[#f29f05]/10 p-4 rounded-lg border border-[#f29f05]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#f29f05]/20 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-[#f29f05]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(order => order.status === 'delivered').length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(order => order.status === 'cancelled').length}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex overflow-x-auto pb-2 space-x-4">
          <button 
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeFilter === "all" 
                ? "bg-[#f29f05] text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Orders
          </button>
          <button 
            onClick={() => setActiveFilter("order-received")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeFilter === "order-received" 
                ? "bg-yellow-500 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            New Orders
          </button>
          <button 
            onClick={() => setActiveFilter("preparing-your-order")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeFilter === "preparing-your-order" 
                ? "bg-[#f29f05] text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Preparing
          </button>
          <button 
            onClick={() => setActiveFilter("wrapping-up")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeFilter === "wrapping-up" 
                ? "bg-blue-500 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Wrapping Up
          </button>
          <button 
            onClick={() => setActiveFilter("delivered")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeFilter === "delivered" 
                ? "bg-green-500 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Delivered
          </button>
          <button 
            onClick={() => setActiveFilter("cancelled")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeFilter === "cancelled" 
                ? "bg-red-500 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-2 text-xl font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-gray-500">
            {activeFilter === "all" 
              ? "You don't have any orders at the moment." 
              : `No orders with status "${activeFilter.replace(/-/g, ' ')}" found.`}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f29f05] hover:bg-[#f29f05]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05] transition-all duration-300"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Orders
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="p-5 flex justify-between items-start border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-[#f29f05]/10 rounded-full flex items-center justify-center">
                    <span className="text-[#f29f05] font-medium">{order.user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{order.user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <svg className="h-3.5 w-3.5 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {order.user.phoneNumber || 'No phone'}
                    </div>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  #{order.orderId}
                </span>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Order Items</div>
                  <div className="space-y-2">
                    {order.foods.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span className="bg-[#f29f05]/10 text-[#f29f05] text-xs rounded-full px-2 py-0.5 mr-2 w-6 text-center">
                            {item.quantity}
                          </span>
                          <span className="truncate max-w-[180px]">{item.name}</span>
                        </div>
                        <span className="font-medium">₹{item.price}</span>
                      </div>
                    ))}
                    {order.foods.length > 3 && (
                      <div className="text-xs text-gray-500 italic mt-1">
                        +{order.foods.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-500">{formatDatetime(order.createdAt)}</span>
                  </div>
                  <div className="font-semibold text-lg">₹{order.total.toFixed(2)}</div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-medium text-gray-500 mr-2">Status</div>
                  <StatusUpdateDropdown 
                    currentStatus={order.status} 
                    onStatusChange={(newStatus) => handleUpdateStatus(order.orderId, newStatus)} 
                  />
                </div>
                
                <button 
                  onClick={() => handleViewOrder(order)}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-[#f29f05] rounded-lg text-[#f29f05] bg-white hover:bg-[#f29f05]/5 font-medium transition-colors duration-300"
                >
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Order Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={handleCloseModal} 
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default Orders;
