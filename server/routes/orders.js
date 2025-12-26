const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Coffee = require('../models/Coffee');
const auth = require('../middleware/auth');

// Get all orders (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, tableNumber, startDate, endDate } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = tableNumber;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.itemId', 'name image cloudinary_url prepTime')
      .limit(100);
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.itemId', 'name image cloudinary_url prepTime description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order (Public - for QR ordering)
router.post('/', async (req, res) => {
  try {
    const { items, customerEmail, customerName, notes, orderSource, tableNumber } = req.body;

    console.log('Order request received:', { orderSource, itemsCount: items?.length, items });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    const source = orderSource || 'QR';

    // Validate and enrich items with current prices and prep times
    const enrichedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await Coffee.findById(item.itemId);
      if (!menuItem) {
        return res.status(400).json({ message: `Item ${item.itemId} not found` });
      }

      let price = 0;
      let priceType = 'Standard';

      if (menuItem.category === 'Coffee') {
        // Use the selected price type
        if (item.priceType === 'Robusta Special' && menuItem.priceRobustaSpecial > 0) {
          price = menuItem.priceRobustaSpecial;
          priceType = 'Robusta Special';
        } else if (item.priceType === 'Blend' && menuItem.priceBlend > 0) {
          price = menuItem.priceBlend;
          priceType = 'Blend';
        } else {
          // Fallback to whichever is available
          price = menuItem.priceRobustaSpecial > 0 ? menuItem.priceRobustaSpecial : menuItem.priceBlend;
          priceType = menuItem.priceRobustaSpecial > 0 ? 'Robusta Special' : 'Blend';
        }
        
        // Validate that we have a valid price for coffee
        if (price <= 0) {
          return res.status(400).json({ 
            message: `Item "${menuItem.name}" has no valid price set. Please set either Blend or Robusta Special price.` 
          });
        }
      } else {
        price = menuItem.price || 0;
        priceType = 'Standard';
        
        // Validate that non-coffee items have a price
        if (price <= 0) {
          return res.status(400).json({ 
            message: `Item "${menuItem.name}" has no price set.` 
          });
        }
      }

      enrichedItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: price,
        priceType: priceType,
        prepTime: menuItem.prepTime || 5
      });

      subtotal += price * item.quantity;
    }

    // Calculate tax (5% GST)
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const order = new Order({
      tableNumber: tableNumber || '',
      items: enrichedItems,
      subtotal,
      tax,
      total,
      customerEmail: customerEmail || '',
      customerName: customerName || '',
      notes: notes || '',
      orderSource: source,
      paymentStatus: source === 'Counter' ? 'Paid' : 'Pending',
      paymentMethod: source === 'Counter' ? 'Cash' : 'Razorpay'
    });

    // Calculate estimated prep time
    order.calculatePrepTime();

    await order.save();

    // Populate for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.itemId', 'name image cloudinary_url prepTime');

    console.log('Order created successfully:', order.orderNumber);
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    // Provide more detailed error message
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${validationErrors}` });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Order number already exists. Please try again.' });
    }
    res.status(500).json({ message: error.message || 'Failed to create order. Please try again.' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    
    if (status === 'Completed') {
      order.completedAt = new Date();
    }

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark receipt as generated
router.put('/:id/receipt', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.receiptGenerated = true;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order receipt data
router.get('/:id/receipt', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.itemId', 'name description image cloudinary_url');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

