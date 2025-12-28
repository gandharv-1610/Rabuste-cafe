const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Indian mobile number validation (10 digits, optionally with +91)
        return /^(\+91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ''));
      },
      message: 'Please provide a valid Indian mobile number'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date,
    default: null
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coffee'
  }],
  // Email marketing consent and subscription fields
  marketingConsent: {
    type: Boolean,
    default: false
  },
  subscribedAt: {
    type: Date,
    default: null
  },
  // Auto-generated tags based on customer behavior
  tags: [{
    type: String,
    default: []
  }]
}, {
  timestamps: true
});

// Normalize mobile number before saving (remove spaces, dashes, ensure +91 prefix)
customerSchema.pre('save', function(next) {
  if (this.mobile) {
    // Remove spaces and dashes
    let normalized = this.mobile.replace(/[\s-]/g, '');
    // Add +91 if it's a 10-digit number starting with 6-9
    if (/^[6-9]\d{9}$/.test(normalized)) {
      this.mobile = '+91' + normalized;
    } else if (normalized.startsWith('+91')) {
      this.mobile = normalized;
    } else if (normalized.startsWith('91') && normalized.length === 12) {
      this.mobile = '+' + normalized;
    } else {
      this.mobile = normalized;
    }
  }
  next();
});

// Index for faster lookups
customerSchema.index({ mobile: 1 });
customerSchema.index({ createdAt: -1 });

// Method to add order to customer
customerSchema.methods.addOrder = function(orderId, orderTotal) {
  if (!this.orders.includes(orderId)) {
    this.orders.push(orderId);
    this.totalOrders += 1;
    this.totalSpent += (orderTotal || 0);
    this.lastOrderDate = new Date();
  }
};

// Method to update marketing consent
customerSchema.methods.updateMarketingConsent = function(consent, email) {
  this.marketingConsent = consent === true;
  if (consent === true && !this.subscribedAt) {
    this.subscribedAt = new Date();
  }
  if (email && email.trim()) {
    this.email = email.trim().toLowerCase();
  }
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

