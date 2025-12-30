const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const WorkshopRegistration = require('../models/WorkshopRegistration');
const Workshop = require('../models/Workshop');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order (for both orders and workshop registrations)
router.post('/create-order', async (req, res) => {
  try {
    const { amount, orderId, customerName, customerEmail, isWorkshop } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: 'Amount and order ID are required' });
    }

    let receipt, notes;

    if (isWorkshop) {
      // Handle workshop registration
      const registration = await WorkshopRegistration.findById(orderId);
      if (!registration) {
        return res.status(404).json({ message: 'Workshop registration not found' });
      }

      if (registration.paymentStatus === 'PAID_ONLINE') {
        return res.status(400).json({ message: 'Registration already paid' });
      }

      receipt = `workshop_${registration.confirmationCode}`;
      notes = {
        registrationId: registration._id.toString(),
        type: 'workshop',
        customerName: registration.name || '',
        customerEmail: registration.email || ''
      };
    } else {
      // Handle regular order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.paymentStatus !== 'Pending') {
        return res.status(400).json({ message: 'Order payment status is not pending' });
      }

      receipt = `order_${order.orderNumber}`;
      notes = {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: customerName || '',
        customerEmail: customerEmail || ''
      };
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: receipt,
      notes: notes
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order/registration with Razorpay order ID
    if (isWorkshop) {
      const registration = await WorkshopRegistration.findById(orderId);
      registration.razorpayOrderId = razorpayOrder.id;
      await registration.save();
    } else {
      const order = await Order.findById(orderId);
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    }

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order' });
  }
});

// Verify payment (for both orders and workshop registrations)
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, isWorkshop } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
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

    if (isWorkshop) {
      // Handle workshop registration payment
      const registration = await WorkshopRegistration.findById(orderId);
      if (!registration) {
        return res.status(404).json({ message: 'Workshop registration not found' });
      }

      // Update registration with payment details
      registration.paymentStatus = 'PAID_ONLINE';
      registration.paymentMethod = 'ONLINE';
      registration.razorpayOrderId = razorpay_order_id;
      registration.razorpayPaymentId = razorpay_payment_id;
      await registration.save();

      // Send confirmation email
      const workshop = await Workshop.findById(registration.workshopId);
      if (workshop) {
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

        await sendWorkshopConfirmationEmail(registration, workshop, calendarUrl, {
          paymentMethod: 'ONLINE',
          paymentStatus: 'PAID_ONLINE',
          amount: registration.amount
        });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        registration: registration
      });
    } else {
      // Handle regular order payment
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Update order with payment details
      order.paymentStatus = 'Paid';
      order.paymentMethod = 'Razorpay';
      order.razorpayOrderId = razorpay_order_id;
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: order
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
});

// Create Razorpay order for workshop
router.post('/workshop/create-order', async (req, res) => {
  try {
    const { amount, workshopId, registrationData } = req.body;

    if (!amount || !workshopId || !registrationData) {
      return res.status(400).json({ message: 'Amount, workshop ID, and registration data are required' });
    }

    // Check Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return res.status(500).json({ message: 'Payment gateway not configured. Please contact support.' });
    }

    // Verify the workshop exists and is active
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (!workshop.isActive) {
      return res.status(400).json({ message: 'Workshop is not active' });
    }

    if (workshop.bookedSeats >= workshop.maxSeats) {
      return res.status(400).json({ message: 'Workshop is fully booked' });
    }

    // Validate amount
    const workshopPrice = workshop.price || 0;
    if (amount !== workshopPrice) {
      return res.status(400).json({ message: 'Amount mismatch with workshop price' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount for payment' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `workshop_${workshopId}_${Date.now()}`,
      notes: {
        workshopId: workshopId.toString(),
        type: 'workshop',
        customerName: registrationData.name || '',
        customerEmail: registrationData.email || ''
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder || !razorpayOrder.id) {
      throw new Error('Failed to create Razorpay order');
    }

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Workshop Razorpay order creation error:', error);
    const errorMessage = error.response?.data?.error?.description || error.message || 'Failed to create payment order';
    res.status(500).json({ message: errorMessage });
  }
});

// Verify workshop payment
router.post('/workshop/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, workshopId, registrationData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !workshopId || !registrationData) {
      return res.status(400).json({ message: 'All payment and registration details are required' });
    }

    // Verify the workshop exists
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (!workshop.isActive) {
      return res.status(400).json({ message: 'Workshop is not active' });
    }

    if (workshop.bookedSeats >= workshop.maxSeats) {
      return res.status(400).json({ message: 'Workshop is fully booked' });
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

    // Create registration with payment details
    const confirmationCode = `WRK${Date.now().toString().slice(-6)}`;
    const registration = new WorkshopRegistration({
      ...registrationData,
      workshopId: workshop._id,
      confirmationCode,
      bookingStatus: 'BOOKED',
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID_ONLINE',
      amount: workshop.price || 0,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });
    await registration.save();

    // Update booked seats
    workshop.bookedSeats += 1;
    await workshop.save();

    // Send confirmation email
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

    await sendWorkshopConfirmationEmail(registration, workshop, calendarUrl, {
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID_ONLINE',
      amount: workshop.price || 0
    });

    res.json({
      success: true,
      message: 'Payment verified and registration confirmed',
      registration: {
        ...registration.toObject(),
        workshop: workshop
      }
    });
  } catch (error) {
    console.error('Workshop payment verification error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
});

module.exports = router;

