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
  },
  subcategory: {
    type: String,
    enum: ['Hot', 'Cold', null],
    default: null
  },
  milkType: {
    type: String,
    enum: ['Milk', 'Non-Milk', null],
    default: null
  },
  strength: {
    type: String,
    enum: ['Mild', 'Medium', 'Strong', 'Extra Strong', null],
    default: null
  },
  flavorNotes: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
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
    enum: ['Counter', 'QR', 'PreOrder'],
    required: true,
    default: 'QR'
  },
  isPreOrder: {
    type: Boolean,
    default: false
  },
  pickupTimeSlot: {
    type: String,
    default: ''
  },
  pickupTime: {
    type: Date,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
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
  refundId: {
    type: String,
    default: ''
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundStatus: {
    type: String,
    enum: ['', 'Pending', 'Processed', 'Failed'],
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
  // Discount fields
  discountType: {
    type: String,
    enum: ['', 'percentage', 'fixed'],
    default: ''
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Applied offer
  appliedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyOffer',
    default: null
  },
  offerDiscountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Subtotal after discount and offer
  discountedSubtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  // Tax fields
  cgstRate: {
    type: Number,
    default: 2.5,
    min: 0
  },
  sgstRate: {
    type: Number,
    default: 2.5,
    min: 0
  },
  cgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  sgstAmount: {
    type: Number,
    default: 0,
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
  customerMobile: {
    type: String,
    trim: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
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
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Generate unique order number and token before saving (only if not already set)
orderSchema.pre('save', async function(next) {
  try {
    // Only generate if order number or token number is missing
    // This allows the route handler to set them explicitly
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
orderSchema.index({ customerMobile: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ isPreOrder: 1 });
orderSchema.index({ pickupTime: 1 });

const Order = mongoose.model('Order', orderSchema);

// Drop old orderId index if it exists (leftover from previous schema)
// This runs once when the model is first loaded
(async () => {
  try {
    // Wait for connection if not ready
    if (mongoose.connection.readyState === 0) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
    }
    
    // Try to drop the old index
    await Order.collection.dropIndex('orderId_1');
    console.log('✅ Dropped old orderId_1 index');
  } catch (err) {
    // Index doesn't exist or already dropped - that's fine
    if (err.code === 27 || err.codeName === 'IndexNotFound') {
      console.log('ℹ️ orderId_1 index not found (already removed or never existed)');
    } else {
      console.log('ℹ️ Could not drop orderId_1 index:', err.message);
    }
  }
})();

module.exports = Order;

