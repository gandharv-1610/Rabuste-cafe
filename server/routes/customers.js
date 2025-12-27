const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// Normalize mobile number helper
const normalizeMobile = (mobile) => {
  if (!mobile) return null;
  let normalized = mobile.replace(/[\s-]/g, '');
  if (/^[6-9]\d{9}$/.test(normalized)) {
    return '+91' + normalized;
  } else if (normalized.startsWith('+91')) {
    return normalized;
  } else if (normalized.startsWith('91') && normalized.length === 12) {
    return '+' + normalized;
  }
  return normalized;
};

// Lookup customer by mobile (for counter - just check if exists)
router.get('/lookup/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const normalizedMobile = normalizeMobile(mobile);

    if (!normalizedMobile || !/^\+91[6-9]\d{9}$/.test(normalizedMobile)) {
      return res.status(400).json({ message: 'Please provide a valid Indian mobile number' });
    }

    const customer = await Customer.findOne({ mobile: normalizedMobile });

    if (customer) {
      return res.json({
        customer,
        exists: true,
        message: 'Customer found'
      });
    } else {
      return res.json({
        customer: null,
        exists: false,
        message: 'Customer not found'
      });
    }
  } catch (error) {
    console.error('Customer lookup error:', error);
    res.status(500).json({ message: error.message || 'Failed to lookup customer' });
  }
});

// Get or create customer by mobile
router.post('/', async (req, res) => {
  try {
    const { mobile, name, email } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    const normalizedMobile = normalizeMobile(mobile);
    
    if (!normalizedMobile || !/^\+91[6-9]\d{9}$/.test(normalizedMobile)) {
      return res.status(400).json({ message: 'Please provide a valid Indian mobile number' });
    }

    // Try to find existing customer
    let customer = await Customer.findOne({ mobile: normalizedMobile });

    if (customer) {
      // Update name and email if provided
      if (name && name.trim()) {
        customer.name = name.trim();
      }
      if (email && email.trim()) {
        customer.email = email.trim().toLowerCase();
      }
      if (customer.isModified()) {
        await customer.save();
      }
      
      return res.json({
        customer,
        isNew: false,
        message: 'Customer found'
      });
    } else {
      // Create new customer
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Name is required for new customers' });
      }

      customer = new Customer({
        mobile: normalizedMobile,
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : ''
      });

      await customer.save();

      return res.json({
        customer,
        isNew: true,
        message: 'New customer created'
      });
    }
  } catch (error) {
    console.error('Customer creation/retrieval error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Mobile number already exists' });
    }
    res.status(500).json({ message: error.message || 'Failed to process customer' });
  }
});

// Get customer by mobile
router.get('/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const normalizedMobile = normalizeMobile(mobile);

    if (!normalizedMobile) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }

    const customer = await Customer.findOne({ mobile: normalizedMobile })
      .populate('orders', 'orderNumber status total createdAt paymentStatus');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: error.message || 'Failed to get customer' });
  }
});

// Get customer orders
router.get('/:mobile/orders', async (req, res) => {
  try {
    const { mobile } = req.params;
    const normalizedMobile = normalizeMobile(mobile);

    if (!normalizedMobile) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }

    const customer = await Customer.findOne({ mobile: normalizedMobile });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get all orders for this customer
    const orders = await Order.find({ customer: customer._id })
      .populate('items.itemId', 'name image cloudinary_url description')
      .sort({ createdAt: -1 });

    // Separate into current processing and past orders
    const currentProcessing = orders.filter(order => 
      ['Pending', 'Preparing', 'Ready'].includes(order.status)
    );
    
    const pastOrders = orders.filter(order => 
      ['Completed', 'Cancelled'].includes(order.status)
    );

    res.json({
      customer: {
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent
      },
      currentProcessing,
      pastOrders,
      allOrders: orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: error.message || 'Failed to get orders' });
  }
});

// Get customer favorites
router.get('/:mobile/favorites', async (req, res) => {
  try {
    const { mobile } = req.params;
    const normalizedMobile = normalizeMobile(mobile);

    if (!normalizedMobile) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }

    const customer = await Customer.findOne({ mobile: normalizedMobile });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      favorites: customer.favorites || []
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: error.message || 'Failed to get favorites' });
  }
});

// Add/remove favorite
router.post('/:mobile/favorites', async (req, res) => {
  try {
    const { mobile } = req.params;
    const { itemId, action } = req.body; // action: 'add' or 'remove'

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "add" or "remove"' });
    }

    const normalizedMobile = normalizeMobile(mobile);

    if (!normalizedMobile) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }

    const customer = await Customer.findOne({ mobile: normalizedMobile });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (action === 'add') {
      if (!customer.favorites.includes(itemId)) {
        customer.favorites.push(itemId);
      }
    } else {
      customer.favorites = customer.favorites.filter(
        fav => fav.toString() !== itemId.toString()
      );
    }

    await customer.save();

    res.json({
      success: true,
      favorites: customer.favorites,
      message: `Item ${action === 'add' ? 'added to' : 'removed from'} favorites`
    });
  } catch (error) {
    console.error('Update favorites error:', error);
    res.status(500).json({ message: error.message || 'Failed to update favorites' });
  }
});

module.exports = router;

