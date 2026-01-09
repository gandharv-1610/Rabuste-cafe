const express = require('express');
const router = express.Router();
const ArtOrder = require('../models/ArtOrder');
const Art = require('../models/Art');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { sendArtOrderConfirmationEmail, sendArtOrderConfirmedEmail, sendArtOrderCancelledEmail } = require('../services/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create art order and Razorpay order
router.post('/create', async (req, res) => {
  try {
    const { artworkId, customerName, email, phone, address, city, pincode } = req.body;

    if (!artworkId || !customerName || !email || !phone || !address || !city || !pincode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify artwork exists and is available
    const artwork = await Art.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check both new status field and old availability field for backward compatibility
    const isAvailable = artwork.status === 'available' || 
                       (!artwork.status && artwork.availability === 'Available');
    
    if (!isAvailable) {
      const statusText = artwork.status || artwork.availability || 'unavailable';
      return res.status(400).json({ 
        message: `This artwork is ${statusText}. It cannot be purchased online.` 
      });
    }

    // Generate order number first
    const count = await ArtOrder.countDocuments();
    const orderNumber = `ART${Date.now().toString().slice(-8)}${String(count + 1).padStart(4, '0')}`;

    // Create art order
    const artOrder = new ArtOrder({
      artworkId,
      orderNumber,
      customerName,
      email: email.toLowerCase().trim(),
      phone,
      address,
      city,
      pincode,
      price: artwork.price,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await artOrder.save();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(artwork.price * 100), // Convert to paise
      currency: 'INR',
      receipt: `art_${orderNumber}`,
      notes: {
        artOrderId: artOrder._id.toString(),
        artworkId: artworkId.toString(),
        customerName,
        customerEmail: email
      }
    });

    // Update art order with Razorpay order ID
    artOrder.razorpayOrderId = razorpayOrder.id;
    await artOrder.save();

    res.json({
      success: true,
      artOrder: artOrder,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Art order creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, artOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !artOrderId) {
      return res.status(400).json({ message: 'All payment details are required' });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update art order
    const artOrder = await ArtOrder.findById(artOrderId);
    if (!artOrder) {
      return res.status(404).json({ message: 'Art order not found' });
    }

    // Check if already paid
    if (artOrder.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Verify artwork is still available
    const artwork = await Art.findById(artOrder.artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check both new status field and old availability field for backward compatibility
    const isAvailable = artwork.status === 'available' || 
                       (!artwork.status && artwork.availability === 'Available');
    
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'Artwork is no longer available for purchase' 
      });
    }

    // Update order
    artOrder.paymentStatus = 'paid';
    artOrder.paymentId = razorpay_payment_id;
    artOrder.razorpayOrderId = razorpay_order_id;
    artOrder.razorpayPaymentId = razorpay_payment_id;
    artOrder.razorpaySignature = razorpay_signature;
    artOrder.orderStatus = 'pending'; // Pending admin approval
    await artOrder.save();

    // Reserve artwork (change status to reserved until admin confirms)
    // Sync both status and availability fields
    artwork.status = 'reserved';
    artwork.availability = 'Reserved';
    await artwork.save();

    // Send confirmation email
    await sendArtOrderConfirmationEmail(artOrder, artwork);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      artOrder: artOrder
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
});

// Get all art orders (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = {};
    
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await ArtOrder.find(filter)
      .populate('artworkId')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching art orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single art order
router.get('/:id', async (req, res) => {
  try {
    const order = await ArtOrder.findById(req.params.id)
      .populate('artworkId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching art order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get art orders by email
router.get('/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    const orders = await ArtOrder.find({ email: normalizedEmail })
      .populate('artworkId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching art orders by email:', error);
    res.status(500).json({ message: error.message });
  }
});

// Track order by order number and email
router.post('/track', async (req, res) => {
  try {
    const { orderNumber, email } = req.body;

    if (!orderNumber || !email) {
      return res.status(400).json({ message: 'Order number and email are required' });
    }

    const order = await ArtOrder.findOne({
      orderNumber: orderNumber.toUpperCase(),
      email: email.toLowerCase().trim()
    }).populate('artworkId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your order number and email.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Accept order
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const order = await ArtOrder.findById(req.params.id).populate('artworkId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be accepted in current status' });
    }

    // Update order status
    order.orderStatus = 'confirmed';
    order.shippingStatus = 'processing';
    await order.save();

    // Update artwork status and availability to sold
    // Sync both status and availability fields
    const artwork = await Art.findById(order.artworkId);
    if (artwork) {
      artwork.status = 'sold';
      artwork.availability = 'Sold';
      await artwork.save();
    }

    // Send confirmation email
    await sendArtOrderConfirmedEmail(order, artwork);

    res.json({
      success: true,
      message: 'Order accepted successfully',
      order: order
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Cancel order with refund
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await ArtOrder.findById(req.params.id).populate('artworkId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    // Refund payment if paid
    if (order.paymentStatus === 'paid' && order.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.price * 100) // Full refund in paise
        });

        order.paymentStatus = 'refunded';
        await order.save();
      } catch (refundError) {
        console.error('Refund error:', refundError);
        // Continue with cancellation even if refund fails
      }
    }

    // Make artwork available again
    // Sync both status and availability fields
    const artwork = await Art.findById(order.artworkId);
    if (artwork && (artwork.status === 'reserved' || artwork.availability === 'Reserved')) {
      artwork.status = 'available';
      artwork.availability = 'Available';
      await artwork.save();
    }

    // Send cancellation email
    await sendArtOrderCancelledEmail(order, artwork, reason);

    res.json({
      success: true,
      message: 'Order cancelled and refund processed',
      order: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update shipping status (Admin)
router.put('/:id/shipping', auth, async (req, res) => {
  try {
    const { shippingStatus, trackingNumber } = req.body;
    const order = await ArtOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (shippingStatus) {
      order.shippingStatus = shippingStatus;
    }
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Shipping status updated',
      order: order
    });
  } catch (error) {
    console.error('Error updating shipping status:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

