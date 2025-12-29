const BillingSettings = require('../models/BillingSettings');
const DailyOffer = require('../models/DailyOffer');

/**
 * Calculate billing for an order
 * @param {Number} subtotal - Subtotal before any discounts
 * @param {Array} items - Order items (for offer matching)
 * @param {Object} options - Additional options
 * @param {String} options.discountType - 'percentage' or 'fixed' or ''
 * @param {Number} options.discountValue - Discount value
 * @param {String} options.appliedOfferId - ID of applied offer
 * @returns {Object} Billing breakdown
 */
async function calculateBilling(subtotal, items = [], options = {}) {
  // Get billing settings
  const billingSettings = await BillingSettings.getSettings();
  
  const {
    discountType = '',
    discountValue = 0,
    appliedOfferId = null
  } = options;

  let discountedSubtotal = subtotal;
  let discountAmount = 0;
  let offerDiscountAmount = 0;
  let appliedOffer = null;

  // Apply daily offer if specified
  if (appliedOfferId) {
    try {
      appliedOffer = await DailyOffer.findById(appliedOfferId);
      if (appliedOffer && appliedOffer.isValid()) {
        // Check if order meets minimum amount
        if (subtotal >= appliedOffer.minOrderAmount) {
          // Check if offer applies to items
          let applicable = true;
          
          // Check category restrictions
          if (appliedOffer.applicableCategories.length > 0) {
            const itemCategories = items.map(item => item.category || 'Coffee');
            applicable = itemCategories.some(cat => appliedOffer.applicableCategories.includes(cat));
          }
          
          // Check item restrictions
          if (applicable && appliedOffer.applicableItems.length > 0) {
            const itemIds = items.map(item => item.itemId?.toString());
            applicable = appliedOffer.applicableItems.some(offerItemId => 
              itemIds.includes(offerItemId.toString())
            );
          }
          
          // If no restrictions, offer applies to all items
          if (appliedOffer.applicableCategories.length === 0 && appliedOffer.applicableItems.length === 0) {
            applicable = true;
          }

          if (applicable) {
            if (appliedOffer.offerType === 'percentage') {
              offerDiscountAmount = (subtotal * appliedOffer.discountValue) / 100;
              if (appliedOffer.maxDiscountAmount && offerDiscountAmount > appliedOffer.maxDiscountAmount) {
                offerDiscountAmount = appliedOffer.maxDiscountAmount;
              }
            } else {
              offerDiscountAmount = appliedOffer.discountValue;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error applying offer:', error);
    }
  }

  // Apply manual discount
  if (discountType === 'percentage' && discountValue > 0) {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === 'fixed' && discountValue > 0) {
    discountAmount = discountValue;
  }

  // Calculate discounted subtotal
  discountedSubtotal = subtotal - discountAmount - offerDiscountAmount;
  if (discountedSubtotal < 0) discountedSubtotal = 0;

  // Calculate tax based on settings
  let taxBase = discountedSubtotal;
  if (billingSettings.taxCalculationMethod === 'onSubtotal') {
    taxBase = subtotal; // Tax on original subtotal
  }

  const cgstAmount = (taxBase * billingSettings.cgstRate) / 100;
  const sgstAmount = (taxBase * billingSettings.sgstRate) / 100;
  const totalTax = cgstAmount + sgstAmount;

  // Calculate final total
  const total = discountedSubtotal + totalTax;

  return {
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    appliedOffer: appliedOffer ? {
      _id: appliedOffer._id,
      name: appliedOffer.name,
      description: appliedOffer.description
    } : null,
    offerDiscountAmount,
    discountedSubtotal,
    cgstRate: billingSettings.cgstRate,
    sgstRate: billingSettings.sgstRate,
    cgstAmount,
    sgstAmount,
    tax: totalTax,
    total: Math.round(total * 100) / 100 // Round to 2 decimal places
  };
}

module.exports = { calculateBilling };

