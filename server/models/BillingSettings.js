const mongoose = require('mongoose');

const billingSettingsSchema = new mongoose.Schema({
  // Tax Settings
  cgstRate: {
    type: Number,
    default: 2.5, // Default 2.5% CGST
    min: 0,
    max: 100
  },
  sgstRate: {
    type: Number,
    default: 2.5, // Default 2.5% SGST
    min: 0,
    max: 100
  },
  // Tax calculation method: 'onSubtotal' or 'onDiscountedSubtotal'
  taxCalculationMethod: {
    type: String,
    enum: ['onSubtotal', 'onDiscountedSubtotal'],
    default: 'onSubtotal' // Tax calculated on subtotal before discount
  },
  // Settings metadata
  updatedBy: {
    type: String,
    default: 'admin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
billingSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('BillingSettings', billingSettingsSchema);

