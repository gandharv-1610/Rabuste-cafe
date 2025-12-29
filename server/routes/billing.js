const express = require('express');
const router = express.Router();
const BillingSettings = require('../models/BillingSettings');
const DailyOffer = require('../models/DailyOffer');
const auth = require('../middleware/auth');

// Get billing settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await BillingSettings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching billing settings:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch billing settings' });
  }
});

// Update billing settings (Admin only)
router.put('/settings', auth, async (req, res) => {
  try {
    const { cgstRate, sgstRate, taxCalculationMethod } = req.body;
    
    let settings = await BillingSettings.findOne();
    if (!settings) {
      settings = new BillingSettings({});
    }
    
    if (cgstRate !== undefined) {
      if (cgstRate < 0 || cgstRate > 100) {
        return res.status(400).json({ message: 'CGST rate must be between 0 and 100' });
      }
      settings.cgstRate = cgstRate;
    }
    
    if (sgstRate !== undefined) {
      if (sgstRate < 0 || sgstRate > 100) {
        return res.status(400).json({ message: 'SGST rate must be between 0 and 100' });
      }
      settings.sgstRate = sgstRate;
    }
    
    if (taxCalculationMethod !== undefined) {
      if (!['onSubtotal', 'onDiscountedSubtotal'].includes(taxCalculationMethod)) {
        return res.status(400).json({ message: 'Invalid tax calculation method' });
      }
      settings.taxCalculationMethod = taxCalculationMethod;
    }
    
    settings.updatedBy = req.user.username || 'admin';
    settings.updatedAt = new Date();
    
    await settings.save();
    res.json({ message: 'Billing settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating billing settings:', error);
    res.status(500).json({ message: error.message || 'Failed to update billing settings' });
  }
});

// Get all daily offers
router.get('/offers', async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};
    
    if (active === 'true') {
      const now = new Date();
      query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
    }
    
    const offers = await DailyOffer.find(query).sort({ priority: -1, createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch offers' });
  }
});

// Get active offers for today
router.get('/offers/active', async (req, res) => {
  try {
    const offers = await DailyOffer.getActiveOffers();
    res.json(offers);
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch active offers' });
  }
});

// Create daily offer (Admin only)
router.post('/offers', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      offerType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      applicableCategories,
      applicableItems,
      startDate,
      endDate,
      applicableDays,
      isActive,
      priority
    } = req.body;
    
    if (!name || !offerType || discountValue === undefined) {
      return res.status(400).json({ message: 'Name, offer type, and discount value are required' });
    }
    
    if (!['percentage', 'fixed'].includes(offerType)) {
      return res.status(400).json({ message: 'Offer type must be "percentage" or "fixed"' });
    }
    
    if (discountValue < 0) {
      return res.status(400).json({ message: 'Discount value must be non-negative' });
    }
    
    if (offerType === 'percentage' && discountValue > 100) {
      return res.status(400).json({ message: 'Percentage discount cannot exceed 100%' });
    }
    
    const offer = new DailyOffer({
      name,
      description: description || '',
      offerType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      applicableCategories: applicableCategories || [],
      applicableItems: applicableItems || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      applicableDays: applicableDays || [],
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0
    });
    
    await offer.save();
    res.status(201).json({ message: 'Offer created successfully', offer });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: error.message || 'Failed to create offer' });
  }
});

// Update daily offer (Admin only)
router.put('/offers/:id', auth, async (req, res) => {
  try {
    const offer = await DailyOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    const {
      name,
      description,
      offerType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      applicableCategories,
      applicableItems,
      startDate,
      endDate,
      applicableDays,
      isActive,
      priority
    } = req.body;
    
    if (name !== undefined) offer.name = name;
    if (description !== undefined) offer.description = description;
    if (offerType !== undefined) {
      if (!['percentage', 'fixed'].includes(offerType)) {
        return res.status(400).json({ message: 'Offer type must be "percentage" or "fixed"' });
      }
      offer.offerType = offerType;
    }
    if (discountValue !== undefined) {
      if (discountValue < 0) {
        return res.status(400).json({ message: 'Discount value must be non-negative' });
      }
      if (offer.offerType === 'percentage' && discountValue > 100) {
        return res.status(400).json({ message: 'Percentage discount cannot exceed 100%' });
      }
      offer.discountValue = discountValue;
    }
    if (minOrderAmount !== undefined) offer.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) offer.maxDiscountAmount = maxDiscountAmount;
    if (applicableCategories !== undefined) offer.applicableCategories = applicableCategories;
    if (applicableItems !== undefined) offer.applicableItems = applicableItems;
    if (startDate !== undefined) offer.startDate = new Date(startDate);
    if (endDate !== undefined) offer.endDate = new Date(endDate);
    if (applicableDays !== undefined) offer.applicableDays = applicableDays;
    if (isActive !== undefined) offer.isActive = isActive;
    if (priority !== undefined) offer.priority = priority;
    
    await offer.save();
    res.json({ message: 'Offer updated successfully', offer });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ message: error.message || 'Failed to update offer' });
  }
});

// Delete daily offer (Admin only)
router.delete('/offers/:id', auth, async (req, res) => {
  try {
    const offer = await DailyOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    await offer.deleteOne();
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ message: error.message || 'Failed to delete offer' });
  }
});

module.exports = router;

