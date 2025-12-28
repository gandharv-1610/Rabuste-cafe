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

    const confirmationCode = `WRK${Date.now().toString().slice(-6)}`;
    const registration = new WorkshopRegistration({
      ...req.body,
      workshopId: workshop._id,
      confirmationCode
    });
    await registration.save();

    // Update booked seats
    workshop.bookedSeats += 1;
    await workshop.save();

    res.status(201).json({
      message: 'Registration successful',
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

