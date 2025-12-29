const mongoose = require('mongoose');

const dailyOfferSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Offer type: 'percentage' or 'fixed'
  offerType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  // Discount value (percentage or fixed amount)
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  // Minimum order amount to apply offer
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Maximum discount amount (for percentage offers)
  maxDiscountAmount: {
    type: Number,
    default: null, // null means no limit
    min: 0
  },
  // Applicable categories (empty array means all categories)
  applicableCategories: [{
    type: String,
    enum: ['Coffee', 'Tea', 'Shakes', 'Sides']
  }],
  // Applicable items (empty array means all items)
  applicableItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coffee'
  }],
  // Offer validity
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Days of week (0 = Sunday, 1 = Monday, etc.) - empty array means all days
  applicableDays: [{
    type: Number,
    min: 0,
    max: 6
  }],
  // Active status
  isActive: {
    type: Boolean,
    default: true
  },
  // Priority (higher number = higher priority)
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
dailyOfferSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

// Method to check if offer is currently valid
dailyOfferSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (now < this.startDate || now > this.endDate) return false;
  
  if (this.applicableDays.length > 0) {
    const currentDay = now.getDay();
    if (!this.applicableDays.includes(currentDay)) return false;
  }
  
  return true;
};

// Static method to get active offers for a given date
dailyOfferSchema.statics.getActiveOffers = async function(date = new Date()) {
  const dayOfWeek = date.getDay();
  
  return await this.find({
    isActive: true,
    startDate: { $lte: date },
    endDate: { $gte: date },
    $or: [
      { applicableDays: { $size: 0 } }, // All days
      { applicableDays: dayOfWeek } // Specific day
    ]
  }).sort({ priority: -1 });
};

module.exports = mongoose.model('DailyOffer', dailyOfferSchema);

