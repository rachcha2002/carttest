const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: Object,
    required: true
  },

  restaurant: {
    type: Object,
    required: true
  },

  foods: [{
    type: Object
  }],

  status: {
    type: String,
    enum: [
      'order-received',
      'preparing-your-order',
      'wrapping-up',
      'picking-up',
      'heading-your-way',
      'delivered',
      'cancelled'
    ],
    default: 'order-received'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },

  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
   
  },
  deliveryLocation: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  deliveryInstructions: String,
  deliveryTimeline: [{
    status: String,
    time: Date,
    description: String
  }],
  estimatedDeliveryTime: Date,

  driver: {
    type: Object
  },

  driverCurrentLocation: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema); 