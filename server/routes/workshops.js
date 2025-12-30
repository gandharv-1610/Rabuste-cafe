const express = require('express');
const router = express.Router();
const Workshop = require('../models/Workshop');
const WorkshopRegistration = require('../models/WorkshopRegistration');

// Get all workshops
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }
    const workshops = await Workshop.find(filter).sort({ date: 1 });
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single workshop
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for workshop
router.post('/:id/register', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (!workshop.isActive) {
      return res.status(400).json({ message: 'Workshop is not active' });
    }

    if (workshop.bookedSeats >= workshop.maxSeats) {
      return res.status(400).json({ message: 'Workshop is fully booked' });
    }

    // Check for duplicate registration
    const existingRegistration = await WorkshopRegistration.findOne({
      email: req.body.email?.toLowerCase().trim(),
      workshopId: workshop._id,
      bookingStatus: { $ne: 'CANCELLED' }
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'You have already registered for this workshop. Each email can only register once per workshop.' 
      });
    }

    const { paymentMethod, createTempOnly } = req.body;
    const workshopPrice = workshop.price || 0;

    // Determine payment method and status based on workshop price and user selection
    let finalPaymentMethod = 'FREE';
    let finalPaymentStatus = 'FREE';

    if (workshopPrice === 0) {
      // Free workshop - auto-confirm
      finalPaymentMethod = 'FREE';
      finalPaymentStatus = 'FREE';
    } else if (workshopPrice > 0) {
      // Paid workshop
      if (paymentMethod === 'ONLINE') {
        if (createTempOnly) {
          // Create temporary registration for payment flow
          finalPaymentMethod = 'ONLINE';
          finalPaymentStatus = 'PENDING_ENTRY_PAYMENT'; // Will be updated after payment
        } else {
          return res.status(400).json({ message: 'Invalid payment flow' });
        }
      } else if (paymentMethod === 'PAY_AT_ENTRY') {
        // Pay at entry - create booking with pending payment
        finalPaymentMethod = 'PAY_AT_ENTRY';
        finalPaymentStatus = 'PENDING_ENTRY_PAYMENT';
      } else {
        return res.status(400).json({ message: 'Payment method required for paid workshops' });
      }
    }

    const confirmationCode = `WRK${Date.now().toString().slice(-6)}`;
    const registration = new WorkshopRegistration({
      ...req.body,
      email: req.body.email?.toLowerCase().trim(),
      workshopId: workshop._id,
      confirmationCode,
      bookingStatus: 'BOOKED',
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      amount: workshopPrice
    });
    await registration.save();

    // Update booked seats
    workshop.bookedSeats += 1;
    await workshop.save();

    // Send confirmation email based on payment type
    const { sendWorkshopConfirmationEmail } = require('../services/emailService');
    const { generateGoogleCalendarUrl } = require('../utils/calendar');
    
    let calendarUrl = null;
    if (workshop.date && workshop.time) {
      calendarUrl = generateGoogleCalendarUrl({
        title: workshop.title,
        description: workshop.description || '',
        location: 'Rabuste Coffee',
        startDate: new Date(workshop.date),
        endDate: new Date(new Date(workshop.date).getTime() + (workshop.duration ? parseInt(workshop.duration) * 60000 : 120 * 60000))
      });
    }

    // Send appropriate email based on payment status
    await sendWorkshopConfirmationEmail(registration, workshop, calendarUrl, {
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      amount: workshopPrice
    });

    res.status(201).json({
      message: finalPaymentStatus === 'PENDING_ENTRY_PAYMENT' 
        ? 'Seat reserved. Payment must be completed at entry counter.'
        : 'Registration successful',
      registration: {
        ...registration.toObject(),
        workshop: workshop
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get registrations for a workshop
router.get('/:id/registrations', async (req, res) => {
  try {
    const registrations = await WorkshopRegistration.find({
      workshopId: req.params.id
    }).populate('workshopId');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create workshop (Admin)
router.post('/', async (req, res) => {
  try {
    const workshop = new Workshop(req.body);
    await workshop.save();
    
    // Send email notification to subscribed customers if workshop is active
    // Prioritize customers with workshop_interested tag
    if (workshop.isActive) {
      const { getSubscribedCustomers, getCustomersByTag } = require('../services/customerTagService');
      const { sendWorkshopAnnouncementEmail, sendBatchMarketingEmails } = require('../services/emailService');
      
      // First, get customers with workshop_interested tag
      let customers = await getCustomersByTag('workshop_interested', true);
      
      // If no workshop_interested customers, send to all subscribed customers
      if (customers.length === 0) {
        customers = await getSubscribedCustomers();
      }
      
      if (customers.length > 0) {
        sendBatchMarketingEmails(customers, sendWorkshopAnnouncementEmail, workshop)
          .then(results => {
            console.log(`📧 Workshop announcement emails sent: ${results.success}/${results.total} successful`);
          })
          .catch(err => {
            console.error('Error sending workshop announcement emails:', err);
          });
      }
    }
    
    res.status(201).json(workshop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update workshop (Admin)
router.put('/:id', async (req, res) => {
  try {
    const oldWorkshop = await Workshop.findById(req.params.id);
    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    // Send email notification if workshop was just activated
    // Only send if workshop is active and was previously inactive
    if (workshop.isActive && (!oldWorkshop || !oldWorkshop.isActive)) {
      const { getSubscribedCustomers, getCustomersByTag } = require('../services/customerTagService');
      const { sendWorkshopAnnouncementEmail, sendBatchMarketingEmails } = require('../services/emailService');
      
      // First, get customers with workshop_interested tag
      let customers = await getCustomersByTag('workshop_interested', true);
      
      // If no workshop_interested customers, send to all subscribed customers
      if (customers.length === 0) {
        customers = await getSubscribedCustomers();
      }
      
      if (customers.length > 0) {
        sendBatchMarketingEmails(customers, sendWorkshopAnnouncementEmail, workshop)
          .then(results => {
            console.log(`📧 Workshop announcement emails sent: ${results.success}/${results.total} successful`);
          })
          .catch(err => {
            console.error('Error sending workshop announcement emails:', err);
          });
      }
    }
    
    res.json(workshop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete workshop (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

