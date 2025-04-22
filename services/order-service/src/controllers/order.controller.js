const Order = require('../models/order.model');
const { v4: uuidv4 } = require('uuid');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Check if orderId is provided from frontend
    if (!orderData.orderId) {
      // Generate a unique orderId if not provided
      orderData.orderId = `ORD-${uuidv4().substring(0, 8)}`;
    }
    
    // Create a new order
    const order = new Order(orderData);
    
    // Add initial timeline event
    order.deliveryTimeline = [{
      status: 'order-received',
      time: new Date(),
      description: 'Order has been received and is being processed'
    }];
    
    // Save the order
    const savedOrder = await order.save();
    
    // Get the io instance from req.app
    const io = req.app.get('io');
    
    // If payment is completed, emit socket event to notify restaurant
    if (savedOrder.paymentStatus === 'completed') {
      const restaurantId = savedOrder.restaurant._id;
      
      // Emit to specific restaurant room
      io.to(`restaurant-${restaurantId}`).emit('new-order', {
        orderId: savedOrder.orderId,
        orderData: savedOrder,
        message: 'New order received!'
      });
      
      console.log(`New order notification sent to restaurant ${restaurantId}`);
    }
    
    res.status(201).json({
      success: true,
      data: savedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get orders by user ID
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ 'user._id': userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get order by order ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, description } = req.body;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update the status
    order.status = status;
    
    // Add to timeline
    order.deliveryTimeline.push({
      status,
      time: new Date(),
      description: description || `Order status updated to ${status}`
    });
    
    // Save the updated order
    const updatedOrder = await order.save();
    
    // Get the io instance from req.app
    const io = req.app.get('io');
    
    // Emit status update event to restaurant
    const restaurantId = updatedOrder.restaurant._id;
    io.to(`restaurant-${restaurantId}`).emit('order-status-update', {
      orderId: updatedOrder.orderId,
      status: updatedOrder.status,
      orderData: updatedOrder,
      message: `Order ${orderId} status updated to ${status}`
    });
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update the payment status
    order.paymentStatus = paymentStatus;
    
    // Add to timeline if payment completed
    if (paymentStatus === 'completed') {
      order.deliveryTimeline.push({
        status: 'payment-completed',
        time: new Date(),
        description: 'Payment has been completed successfully'
      });
      
      // Get the io instance from req.app
      const io = req.app.get('io');
      
      // Emit new order event to restaurant when payment is completed
      const restaurantId = order.restaurant._id;
      io.to(`restaurant-${restaurantId}`).emit('new-order', {
        orderId: order.orderId,
        orderData: order,
        message: 'New order received with completed payment!'
      });
    }
    
    // Save the updated order
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Assign driver to order
exports.assignDriver = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driver } = req.body;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Assign driver
    order.driver = driver;
    
    // Add to timeline
    order.deliveryTimeline.push({
      status: 'driver-assigned',
      time: new Date(),
      description: `Driver ${driver.name} has been assigned to your order`
    });
    
    // Save the updated order
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update driver location
exports.updateDriverLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { latitude, longitude } = req.body;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update driver location
    order.driverCurrentLocation = {
      latitude,
      longitude,
      updatedAt: new Date()
    };
    
    // Save the updated order
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get orders by restaurant ID with completed payment
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const orders = await Order.find({ 
      'restaurant._id': restaurantId,
      'paymentStatus': 'completed'
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 