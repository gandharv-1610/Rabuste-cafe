const express = require('express');
const router = express.Router();
const Coffee = require('../models/Coffee');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

// Get all coffee items
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.subcategory) {
      filter.subcategory = req.query.subcategory;
    }
    if (req.query.milkType) {
      filter.milkType = req.query.milkType;
    }
    const coffees = await Coffee.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(coffees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single coffee item
router.get('/:id', async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) {
      return res.status(404).json({ message: 'Coffee not found' });
    }
    res.json(coffee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create coffee item (Admin)
router.post('/', async (req, res) => {
  try {
    const coffee = new Coffee(req.body);
    await coffee.save();
    
    // Send email notification to subscribed customers (async, don't block response)
    // Only send if this is a new coffee item (not an update)
    if (coffee.category === 'Coffee') {
      const { getSubscribedCustomers } = require('../services/customerTagService');
      const { sendCoffeeAnnouncementEmail, sendBatchMarketingEmails } = require('../services/emailService');
      
      // Get customers with marketing consent, optionally filter by coffee_lover tag
      const customers = await getSubscribedCustomers(['coffee_lover']);
      
      // If no coffee_lovers, send to all subscribed customers
      const allCustomers = customers.length > 0 
        ? customers 
        : await getSubscribedCustomers();
      
      if (allCustomers.length > 0) {
        sendBatchMarketingEmails(allCustomers, sendCoffeeAnnouncementEmail, coffee)
          .then(results => {
            console.log(`📧 Coffee announcement emails sent: ${results.success}/${results.total} successful`);
          })
          .catch(err => {
            console.error('Error sending coffee announcement emails:', err);
          });
      }
    }
    
    res.status(201).json(coffee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update coffee item (Admin)
router.put('/:id', async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) {
      return res.status(404).json({ message: 'Coffee not found' });
    }

    // If updating image and old image exists on Cloudinary, delete it
    if (req.body.cloudinary_public_id && coffee.cloudinary_public_id && 
        req.body.cloudinary_public_id !== coffee.cloudinary_public_id) {
      try {
        await deleteFromCloudinary(coffee.cloudinary_public_id, 'image');
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    const updatedCoffee = await Coffee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedCoffee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete coffee item (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) {
      return res.status(404).json({ message: 'Coffee not found' });
    }

    // Delete from Cloudinary if exists
    if (coffee.cloudinary_public_id) {
      try {
        await deleteFromCloudinary(coffee.cloudinary_public_id, 'image');
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }

    await Coffee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coffee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

