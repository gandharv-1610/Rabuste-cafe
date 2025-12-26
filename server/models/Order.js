const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coffee',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceType: {
    type: String,
    enum: ['Blend', 'Robusta Special', 'Standard'],
    default: 'Standard'
  },
  prepTime: {
    type: Number,
    default: 5,
    min: 0
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  tokenNumber: {
    type: Number,
    default: 0
  },
  tableNumber: {
    type: String,
    trim: true,
    default: ''
  },
  orderSource: {
    type: String,
    enum: ['Counter', 'QR'],
    required: true,
    default: 'QR'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    required: true,
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Razorpay', 'Other'],
    default: 'Cash'
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
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  estimatedPrepTime: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  customerName: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Generate unique order number and token before saving
orderSchema.pre('save', async function(next) {
  try {
    // Lazy load to avoid circular dependency
    if (!this.orderNumber || !this.tokenNumber || this.tokenNumber === 0) {
      const { getNextOrderNumber, getNextTokenNumber } = require('./OrderCounter');
      
      // Generate sequential order number if not set
      if (!this.orderNumber) {
        this.orderNumber = await getNextOrderNumber();
      }
      
      // Generate token number if not set
      if (!this.tokenNumber || this.tokenNumber === 0) {
        this.tokenNumber = await getNextTokenNumber();
      }
    }
    
    // Auto-mark counter orders as paid
    if (this.orderSource === 'Counter' && this.paymentStatus === 'Pending') {
      this.paymentStatus = 'Paid';
      this.paymentMethod = 'Cash';
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate estimated prep time based on items
orderSchema.methods.calculatePrepTime = function() {
  if (!this.items || this.items.length === 0) {
    this.estimatedPrepTime = 0;
    return;
  }
  
  // Use the maximum prep time from items (parallel preparation)
  // Or sum if sequential, but typically cafes prepare in parallel
  const maxPrepTime = Math.max(...this.items.map(item => item.prepTime || 5));
  // Add buffer time based on quantity
  const quantityFactor = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const buffer = Math.ceil(quantityFactor / 3); // 1 minute buffer per 3 items
  
  this.estimatedPrepTime = maxPrepTime + buffer;
};

// Index for faster queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ tokenNumber: 1 });
orderSchema.index({ orderSource: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);

