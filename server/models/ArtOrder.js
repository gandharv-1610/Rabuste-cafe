const mongoose = require('mongoose');

const artOrderSchema = new mongoose.Schema({
  artworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Art',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  paymentId: {
    type: String,
    default: ''
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  razorpaySignature: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'shipped', 'delivered'],
    default: 'pending'
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  shippingStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate order number before saving (only if not provided)
artOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const count = await mongoose.model('ArtOrder').countDocuments();
      this.orderNumber = `ART${Date.now().toString().slice(-8)}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      // Fallback if count fails
      this.orderNumber = `ART${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  }
  next();
});

module.exports = mongoose.model('ArtOrder', artOrderSchema);

