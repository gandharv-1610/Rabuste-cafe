const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

// Get offers (optionally only active & within date)
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.active === 'true') {
      filter.isActive = true;

      const now = new Date();
      filter.$and = [
        {
          $or: [
            { startDate: { $lte: now } },
            { startDate: { $exists: false } },
            { startDate: null },
          ],
        },
        {
          $or: [
            { endDate: { $gte: now } },
            { endDate: { $exists: false } },
            { endDate: null },
          ],
        },
      ];
    }

    const offers = await Offer.find(filter).sort({ highlight: -1, order: 1, createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create offer (Admin)
router.post('/', async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    
    // Send email notification to subscribed customers if offer is active
    // IMPORTANT: Only send if offer is active and within valid date range
    if (offer.isActive) {
      const now = new Date();
      const isWithinDateRange = (!offer.startDate || new Date(offer.startDate) <= now) &&
                                 (!offer.endDate || new Date(offer.endDate) >= now);
      
      if (isWithinDateRange) {
        const { getSubscribedCustomers } = require('../services/customerTagService');
        const { sendOfferAnnouncementEmail, sendBatchMarketingEmails } = require('../services/emailService');
        
        // Get all subscribed customers for offers
        const customers = await getSubscribedCustomers();
        
        if (customers.length > 0) {
          sendBatchMarketingEmails(customers, sendOfferAnnouncementEmail, offer)
            .then(results => {
              console.log(`📧 Offer announcement emails sent: ${results.success}/${results.total} successful`);
            })
            .catch(err => {
              console.error('Error sending offer announcement emails:', err);
            });
        }
      }
    }
    
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update offer (Admin)
router.put('/:id', async (req, res) => {
  try {
    const oldOffer = await Offer.findById(req.params.id);
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Send email notification if offer was just activated or newly created
    // Only send if offer is active and within valid date range
    if (offer.isActive && (!oldOffer || !oldOffer.isActive)) {
      const now = new Date();
      const isWithinDateRange = (!offer.startDate || new Date(offer.startDate) <= now) &&
                                 (!offer.endDate || new Date(offer.endDate) >= now);
      
      if (isWithinDateRange) {
        const { getSubscribedCustomers } = require('../services/customerTagService');
        const { sendOfferAnnouncementEmail, sendBatchMarketingEmails } = require('../services/emailService');
        
        // Get all subscribed customers for offers
        const customers = await getSubscribedCustomers();
        
        if (customers.length > 0) {
          sendBatchMarketingEmails(customers, sendOfferAnnouncementEmail, offer)
            .then(results => {
              console.log(`📧 Offer announcement emails sent: ${results.success}/${results.total} successful`);
            })
            .catch(err => {
              console.error('Error sending offer announcement emails:', err);
            });
        }
      }
    }
    
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete offer (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


