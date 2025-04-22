const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'LKR'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'card'
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: false
  },
  customerEmail: {
    type: String,
    required: false
  },
  customerName: {
    type: String,
    required: false
  },
  billingDetails: {
    address: {
      type: Object,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
  },
  metadata: {
    type: Object,
    required: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', PaymentSchema); 