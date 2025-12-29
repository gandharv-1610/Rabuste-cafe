const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Coffee = require('../models/Coffee');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const { sendPreOrderAcceptanceEmail, sendPreOrderCancellationEmail } = require('../services/emailService');
const { calculateBilling } = require('../utils/billingCalculator');

// Initialize Razorpay for refunds
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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

// Get all orders (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, tableNumber, startDate, endDate } = req.query;
    const filter = {};
    
    // Show orders that are either:
    // 1. Paid (completed payment)
    // 2. Pending payment with Cash method (Pay at Counter - needs confirmation)
    filter.$or = [
      { paymentStatus: 'Paid' },
      { paymentStatus: 'Pending', paymentMethod: 'Cash' }
    ];
    
    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = tableNumber;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)       filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.itemId', 'name image cloudinary_url prepTime category subcategory milkType strength flavorNotes description')
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

// Create new order (Public - for QR ordering and pre-orders)
router.post('/', async (req, res) => {
  try {
    const { items, customerMobile, customerName, customerEmail, notes, orderSource, tableNumber, paymentMethod, marketingConsent, isPreOrder, pickupTimeSlot, pickupTime, discountType, discountValue, appliedOfferId } = req.body;

    console.log('Order request received:', { orderSource, itemsCount: items?.length, customerMobile });

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!customerMobile || !customerMobile.trim()) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const normalizedMobile = normalizeMobile(customerMobile);
    
    if (!normalizedMobile || !/^\+91[6-9]\d{9}$/.test(normalizedMobile)) {
      return res.status(400).json({ message: 'Please provide a valid Indian mobile number' });
    }

    // Pre-order validation
    if (isPreOrder) {
      if (!customerEmail || !customerEmail.trim()) {
        return res.status(400).json({ message: 'Email is required for pre-orders' });
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      
      // Check if customer email is verified
      const customer = await Customer.findOne({ mobile: normalizedMobile });
      if (customer && customer.email.toLowerCase() === customerEmail.trim().toLowerCase() && !customer.emailVerified) {
        return res.status(400).json({ message: 'Please verify your email address before placing a pre-order' });
      }
      
      if (!pickupTimeSlot || !pickupTime) {
        return res.status(400).json({ message: 'Pickup time slot is required for pre-orders' });
      }
      
      // Validate pickup time is in the future and within cafe hours
      const pickupDate = new Date(pickupTime);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      if (pickupDate < oneHourFromNow) {
        return res.status(400).json({ message: 'Pickup time must be at least 1 hour from now' });
      }
      
      const pickupHour = pickupDate.getHours();
      if (pickupHour < 11 || pickupHour >= 23) {
        return res.status(400).json({ message: 'Pickup time must be between 11 AM and 11 PM' });
      }
    }

    const source = orderSource || (isPreOrder ? 'PreOrder' : 'QR');

    // Get or create customer
    let customer = await Customer.findOne({ mobile: normalizedMobile });
    
    if (!customer) {
      // Create new customer
      customer = new Customer({
        mobile: normalizedMobile,
        name: customerName.trim(),
        email: customerEmail ? customerEmail.trim().toLowerCase() : ''
      });
      
      // Handle marketing consent for new customers
      // IMPORTANT: Only set consent if explicitly provided and true
      if (marketingConsent === true && customerEmail && customerEmail.trim()) {
        customer.updateMarketingConsent(true, customerEmail.trim().toLowerCase());
      }
      
      await customer.save();
      console.log('✅ New customer created:', customer.mobile);
    } else {
      // Update existing customer info if provided
      if (customerName && customerName.trim() && customer.name !== customerName.trim()) {
        customer.name = customerName.trim();
      }
      if (customerEmail && customerEmail.trim() && customer.email !== customerEmail.trim().toLowerCase()) {
        customer.email = customerEmail.trim().toLowerCase();
      }
      
      // Handle marketing consent update for existing customers
      // IMPORTANT: Only update if explicitly provided
      if (marketingConsent !== undefined) {
        if (marketingConsent === true && customerEmail && customerEmail.trim()) {
          customer.updateMarketingConsent(true, customerEmail.trim().toLowerCase());
        } else if (marketingConsent === false) {
          // Allow customers to opt-out
          customer.marketingConsent = false;
        }
      }
      
      if (customer.isModified()) {
        await customer.save();
      }
    }

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
        prepTime: menuItem.prepTime || 5,
        category: menuItem.category || 'Coffee',
        subcategory: menuItem.subcategory || null,
        milkType: menuItem.milkType || null,
        strength: menuItem.strength || null,
        flavorNotes: menuItem.flavorNotes || [],
        description: menuItem.description || ''
      });

      subtotal += price * item.quantity;
    }

    // Calculate billing with discounts, offers, and taxes
    const billing = await calculateBilling(subtotal, enrichedItems, {
      discountType: discountType || '',
      discountValue: discountValue || 0,
      appliedOfferId: appliedOfferId || null
    });

    // Generate order number and token number upfront
    const { getNextOrderNumber, getNextTokenNumber } = require('../models/OrderCounter');
    
    // Find a unique order number by checking against database
    let orderNumber = null;
    let tokenNumber = await getNextTokenNumber();
    const maxAttempts = 20;
    let attempts = 0;

    // Keep generating order numbers until we find one that doesn't exist
    while (!orderNumber && attempts < maxAttempts) {
      attempts++;
      const candidateNumber = await getNextOrderNumber();
      
      // Check if this order number already exists
      const existingOrder = await Order.findOne({ orderNumber: candidateNumber });
      
      if (!existingOrder) {
        // This number is available, use it
        orderNumber = candidateNumber;
        console.log(`✅ Found unique order number: ${orderNumber} (after ${attempts} attempt(s))`);
      } else {
        console.log(`⚠️ Order number ${candidateNumber} already exists, trying next number...`);
        // Continue loop to get next number
      }
    }

    if (!orderNumber) {
      throw new Error('Failed to generate unique order number after multiple attempts');
    }

    // Create order with the unique order number
    let savedOrder = null;
    let order = null;
    
    try {
      order = new Order({
        orderNumber,
        tokenNumber,
        tableNumber: tableNumber || '',
        items: enrichedItems,
        subtotal: billing.subtotal,
        discountType: billing.discountType,
        discountValue: billing.discountValue,
        discountAmount: billing.discountAmount,
        appliedOffer: billing.appliedOffer ? billing.appliedOffer._id : null,
        offerDiscountAmount: billing.offerDiscountAmount,
        discountedSubtotal: billing.discountedSubtotal,
        cgstRate: billing.cgstRate,
        sgstRate: billing.sgstRate,
        cgstAmount: billing.cgstAmount,
        sgstAmount: billing.sgstAmount,
        tax: billing.tax,
        total: billing.total,
        customerMobile: normalizedMobile,
        customer: customer._id,
        customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : customer.email || '',
        customerName: customerName.trim(),
        notes: notes || '',
        orderSource: source,
        isPreOrder: isPreOrder || false,
        pickupTimeSlot: pickupTimeSlot || '',
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        paymentStatus: source === 'Counter' ? 'Paid' : (isPreOrder ? 'Pending' : (paymentMethod === 'counter' ? 'Pending' : 'Pending')),
        paymentMethod: source === 'Counter' ? 'Cash' : (isPreOrder ? 'Razorpay' : (paymentMethod === 'counter' ? 'Cash' : 'Razorpay'))
      });

      // Calculate estimated prep time
      order.calculatePrepTime();

      // Save the order
      await order.save();
      savedOrder = order;

      // Update customer with new order
      customer.addOrder(order._id, order.total);
      await customer.save();

      // Update customer tags after order (async, don't block response)
      const { updateCustomerTags } = require('../services/customerTagService');
      updateCustomerTags(customer._id).catch(err => {
        console.error('Error updating customer tags:', err);
      });

      console.log(`✅ Order created successfully with order number: ${orderNumber} for customer: ${customer.mobile}`);
    } catch (saveError) {
      console.error(`❌ Error saving order with number ${orderNumber}:`, {
        code: saveError.code,
        message: saveError.message
      });
      
      // Check if error is about orderId (old index issue)
      if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.orderId) {
        console.error('❌ Error: Old orderId index found in database. Attempting to drop it...');
        try {
          await Order.collection.dropIndex('orderId_1');
          console.log('✅ Dropped old orderId_1 index. Please try creating the order again.');
          // Retry saving with the same order
          await order.save();
          savedOrder = order;
          console.log(`✅ Order saved successfully after dropping old index`);
        } catch (dropError) {
          console.error('❌ Could not drop orderId_1 index. Please manually drop it from MongoDB:', dropError.message);
          throw new Error('Database index error: Please contact administrator to drop the old orderId_1 index from the orders collection.');
        }
      }
      // If it's still a duplicate (race condition), try one more time with a new number
      else if (saveError.code === 11000 && order && saveError.keyPattern && saveError.keyPattern.orderNumber) {
        console.log(`🔄 Race condition detected, generating new order number...`);
        const newOrderNumber = await getNextOrderNumber();
        const existingCheck = await Order.findOne({ orderNumber: newOrderNumber });
        
        if (!existingCheck) {
          // Try again with the new number
          order.orderNumber = newOrderNumber;
          await order.save();
          savedOrder = order;
          console.log(`✅ Order saved with new order number: ${newOrderNumber}`);
        } else {
          throw new Error('Unable to create order due to persistent duplicate order numbers');
        }
      } else {
        throw saveError;
      }
    }

    if (!savedOrder) {
      throw new Error('Failed to create order after multiple retries');
    }

    // Populate for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.itemId', 'name image cloudinary_url prepTime');

    console.log('Order created successfully:', savedOrder.orderNumber);
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

// Confirm payment for counter orders (Admin only)
router.put('/:id/confirm-payment', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Pending' || order.paymentMethod !== 'Cash') {
      return res.status(400).json({ message: 'This order does not require payment confirmation' });
    }

    order.paymentStatus = 'Paid';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update estimated prep time (Admin only)
router.put('/:id/estimated-prep-time', auth, async (req, res) => {
  try {
    const { estimatedPrepTime } = req.body;
    
    if (estimatedPrepTime === undefined || estimatedPrepTime === null) {
      return res.status(400).json({ message: 'Estimated prep time is required' });
    }

    const minutes = parseInt(estimatedPrepTime);
    if (isNaN(minutes) || minutes < 0) {
      return res.status(400).json({ message: 'Estimated prep time must be a non-negative number' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.estimatedPrepTime = minutes;
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

// Accept pre-order (Admin only)
router.put('/:id/accept-preorder', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPreOrder) {
      return res.status(400).json({ message: 'This is not a pre-order' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending pre-orders can be accepted' });
    }

    // Update order status to Preparing
    order.status = 'Preparing';
    await order.save();

    // Send acceptance email
    if (order.customerEmail) {
      try {
        await sendPreOrderAcceptanceEmail(order);
      } catch (emailError) {
        console.error('Error sending acceptance email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({ message: 'Pre-order accepted successfully', order });
  } catch (error) {
    console.error('Error accepting pre-order:', error);
    res.status(500).json({ message: error.message || 'Failed to accept pre-order' });
  }
});

// Cancel pre-order with refund (Admin only)
router.put('/:id/cancel-preorder', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPreOrder) {
      return res.status(400).json({ message: 'This is not a pre-order' });
    }

    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already completed or cancelled' });
    }

    // Process refund if payment was made
    if (order.paymentStatus === 'Paid' && order.razorpayPaymentId) {
      try {
        // Check if refund already exists
        if (order.refundId && order.refundStatus === 'Processed') {
          console.log('Refund already processed for this order');
        } else {
          // Attempt to process refund
          const refundAmount = Math.round(order.total * 100); // Convert to paise
          
          const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: refundAmount,
            speed: 'normal', // 'normal' or 'optimum' - normal is standard, optimum is faster but may have fees
            notes: {
              reason: 'Pre-order cancelled by admin',
              orderNumber: order.orderNumber,
              cancelledBy: 'admin'
            }
          });
          
          // Store refund information
          order.refundId = refund.id;
          order.refundAmount = order.total;
          order.refundStatus = refund.status === 'processed' ? 'Processed' : 'Pending';
          
          console.log('Refund processed successfully:', {
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount / 100
          });
        }
      } catch (refundError) {
        console.error('Refund error details:', {
          error: refundError.error,
          description: refundError.error?.description,
          code: refundError.error?.code,
          paymentId: order.razorpayPaymentId
        });
        
        // Set refund status to failed
        order.refundStatus = 'Failed';
        
        // Provide specific error messages based on error type
        let errorMessage = 'Failed to process automatic refund. ';
        
        if (refundError.error) {
          const errorCode = refundError.error.code;
          const errorDesc = refundError.error.description || '';
          
          if (errorCode === 'BAD_REQUEST_ERROR') {
            if (errorDesc.includes('old') || errorDesc.includes('time')) {
              errorMessage += 'Payment is too old for automatic refund. Please process manually through Razorpay dashboard.';
            } else if (errorDesc.includes('UPI') || errorDesc.includes('account')) {
              errorMessage += 'This payment method does not support automatic refunds. Please obtain customer bank details and process manually through Razorpay Support Portal.';
            } else {
              errorMessage += errorDesc || 'Please process refund manually through Razorpay dashboard.';
            }
          } else if (errorCode === 'GATEWAY_ERROR') {
            errorMessage += 'Payment gateway error. Please try again or process manually.';
          } else {
            errorMessage += errorDesc || 'Please process refund manually through Razorpay dashboard.';
          }
        } else {
          errorMessage += 'Please process refund manually through Razorpay dashboard.';
        }
        
        // Still cancel the order but inform admin about refund issue
        // Don't return error - allow cancellation to proceed
        console.warn('Order will be cancelled but refund needs manual processing:', errorMessage);
      }
    } else if (order.paymentStatus === 'Paid' && !order.razorpayPaymentId) {
      // Payment marked as paid but no payment ID - might be cash or other method
      console.warn('Order marked as paid but no Razorpay payment ID found. No refund needed.');
    }

    // Update order status
    order.status = 'Cancelled';
    // Update payment status based on refund status
    if (order.paymentStatus === 'Paid') {
      if (order.refundStatus === 'Processed' || order.refundStatus === 'Pending') {
        order.paymentStatus = 'Refunded';
      } else if (order.refundStatus === 'Failed') {
        // Keep as Paid but note that refund failed
        order.paymentStatus = 'Paid'; // Will need manual refund
      } else {
        order.paymentStatus = 'Refunded';
      }
    }
    await order.save();

    // Send cancellation email
    if (order.customerEmail) {
      try {
        await sendPreOrderCancellationEmail(order);
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Prepare response message
    let responseMessage = 'Pre-order cancelled successfully. ';
    if (order.refundStatus === 'Processed' || order.refundStatus === 'Pending') {
      responseMessage += 'Refund has been processed and will be credited to the customer within 5-7 business days.';
    } else if (order.refundStatus === 'Failed') {
      responseMessage += '⚠️ WARNING: Automatic refund failed. Please process refund manually through Razorpay dashboard. Payment ID: ' + order.razorpayPaymentId;
    } else if (order.paymentStatus === 'Paid' && !order.razorpayPaymentId) {
      responseMessage += 'No refund needed (payment method does not require refund).';
    } else {
      responseMessage += 'Refund processed successfully.';
    }
    
    res.json({ 
      message: responseMessage,
      order,
      refundStatus: order.refundStatus,
      refundId: order.refundId
    });
  } catch (error) {
    console.error('Error cancelling pre-order:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel pre-order' });
  }
});

module.exports = router;

