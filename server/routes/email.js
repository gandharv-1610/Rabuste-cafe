const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const WorkshopRegistration = require('../models/WorkshopRegistration');
const Workshop = require('../models/Workshop');
const FranchiseEnquiry = require('../models/FranchiseEnquiry');
const ArtEnquiry = require('../models/ArtEnquiry');
const Art = require('../models/Art');
const { generateOTP, sendOTPEmail, sendWorkshopConfirmationEmail, sendFranchiseConfirmationEmail, sendArtEnquiryConfirmationEmail } = require('../services/emailService');
const { buildGoogleCalendarUrlForWorkshop } = require('../utils/calendar');

// Send OTP for Workshop Registration
router.post('/workshop/otp', async (req, res) => {
  try {
    const { email, registrationData } = req.body;

    if (!email || !registrationData) {
      return res.status(400).json({ message: 'Email and registration data are required' });
    }

    // Check if email is already registered for this workshop
    const existingRegistration = await WorkshopRegistration.findOne({
      email: email.toLowerCase().trim(),
      workshopId: registrationData.workshopId,
      status: { $ne: 'Cancelled' } // Allow re-registration if previous was cancelled
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'You have already registered for this workshop. Each email can only register once per workshop.' 
      });
    }

    const otp = generateOTP();
    
    // Save OTP to database
    const otpRecord = new OTP({
      email,
      otp,
      type: 'workshop',
      data: registrationData,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpRecord.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, 'workshop');
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent to your email',
      expiresIn: 600 // seconds
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP only (for online payments - doesn't create registration)
router.post('/workshop/verify-otp-only', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'workshop',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified but don't create registration
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP and Complete Workshop Registration
router.post('/workshop/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'workshop',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Get workshop and check availability
    const workshop = await Workshop.findById(otpRecord.data.workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (!workshop.isActive) {
      return res.status(400).json({ message: 'Workshop is not active' });
    }

    if (workshop.bookedSeats >= workshop.maxSeats) {
      return res.status(400).json({ message: 'Workshop is fully booked' });
    }

    // Check again if email is already registered (double-check before creating)
    const existingRegistration = await WorkshopRegistration.findOne({
      email: email.toLowerCase().trim(),
      workshopId: workshop._id,
      status: { $ne: 'Cancelled' }
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'You have already registered for this workshop. Each email can only register once per workshop.' 
      });
    }

    // Determine payment method and status
    const workshopPrice = workshop.price || 0;
    const paymentMethod = otpRecord.data.paymentMethod || (workshopPrice === 0 ? 'FREE' : null);
    let finalPaymentMethod = 'FREE';
    let finalPaymentStatus = 'FREE';

    if (workshopPrice === 0) {
      finalPaymentMethod = 'FREE';
      finalPaymentStatus = 'FREE';
    } else if (workshopPrice > 0) {
      if (paymentMethod === 'PAY_AT_ENTRY') {
        finalPaymentMethod = 'PAY_AT_ENTRY';
        finalPaymentStatus = 'PENDING_ENTRY_PAYMENT';
      } else if (paymentMethod === 'ONLINE') {
        // For online payment, OTP verification is done, but payment will be handled separately
        // This should not reach here for online payments
        return res.status(400).json({ message: 'Invalid payment flow for online payment' });
      } else {
        return res.status(400).json({ message: 'Payment method required for paid workshops' });
      }
    }

    // Create registration
    const confirmationCode = `WRK${Date.now().toString().slice(-6)}`;
    const registration = new WorkshopRegistration({
      ...otpRecord.data,
      email: email.toLowerCase().trim(), // Ensure lowercase
      workshopId: workshop._id,
      confirmationCode,
      bookingStatus: 'BOOKED',
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      amount: workshopPrice
    });
    
    try {
      await registration.save();
    } catch (error) {
      // Handle duplicate key error (if unique index is set)
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'You have already registered for this workshop. Each email can only register once per workshop.' 
        });
      }
      throw error;
    }

    // Update booked seats
    workshop.bookedSeats += 1;
    await workshop.save();

    // Build Google Calendar URL (non-fatal if it fails)
    let calendarUrl;
    try {
      calendarUrl = buildGoogleCalendarUrlForWorkshop(workshop);
    } catch (err) {
      console.error('Error building Google Calendar URL:', err);
    }

    // Send confirmation email
    await sendWorkshopConfirmationEmail(registration, workshop, calendarUrl, {
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      amount: workshopPrice
    });

    res.status(201).json({
      message: 'Registration successful',
      registration: {
        ...registration.toObject(),
        workshop: workshop
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send OTP for Franchise Enquiry
router.post('/franchise/otp', async (req, res) => {
  try {
    const { email, enquiryData } = req.body;

    if (!email || !enquiryData) {
      return res.status(400).json({ message: 'Email and enquiry data are required' });
    }

    const otp = generateOTP();
    
    const otpRecord = new OTP({
      email,
      otp,
      type: 'franchise',
      data: enquiryData,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await otpRecord.save();

    const emailSent = await sendOTPEmail(email, otp, 'franchise');
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent to your email',
      expiresIn: 600
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP and Submit Franchise Enquiry
router.post('/franchise/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'franchise',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    // Create enquiry
    const enquiry = new FranchiseEnquiry(otpRecord.data);
    await enquiry.save();

    // Send confirmation email
    await sendFranchiseConfirmationEmail(enquiry);

    res.status(201).json({
      message: 'Franchise enquiry submitted successfully',
      enquiry
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send OTP for Art Enquiry
router.post('/art/otp', async (req, res) => {
  try {
    const { email, enquiryData } = req.body;

    if (!email || !enquiryData) {
      return res.status(400).json({ message: 'Email and enquiry data are required' });
    }

    // Verify art exists
    const art = await Art.findById(enquiryData.artId);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    const otp = generateOTP();
    
    const otpRecord = new OTP({
      email,
      otp,
      type: 'art',
      data: enquiryData,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await otpRecord.save();

    const emailSent = await sendOTPEmail(email, otp, 'art');
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent to your email',
      expiresIn: 600
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP and Submit Art Enquiry
router.post('/art/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'art',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    // Verify art still exists
    const art = await Art.findById(otpRecord.data.artId);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    // Create enquiry
    const enquiry = new ArtEnquiry(otpRecord.data);
    await enquiry.save();

    // Send confirmation email
    await sendArtEnquiryConfirmationEmail(enquiry, art);

    res.status(201).json({
      message: 'Art enquiry submitted successfully',
      enquiry
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send OTP for Art Order Checkout
router.post('/art-order/otp', async (req, res) => {
  try {
    const { email, orderData } = req.body;

    if (!email || !orderData) {
      return res.status(400).json({ message: 'Email and order data are required' });
    }

    // Verify art exists and is available
    const art = await Art.findById(orderData.artworkId);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    const isAvailable = art.status === 'available' || 
                       (!art.status && art.availability === 'Available');
    
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'This artwork is no longer available for purchase' 
      });
    }

    const otp = generateOTP();
    
    const otpRecord = new OTP({
      email: email.toLowerCase().trim(),
      otp,
      type: 'art-order',
      data: orderData,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpRecord.save();

    const emailSent = await sendOTPEmail(email, otp, 'art-order');
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent to your email',
      expiresIn: 600
    });
  } catch (error) {
    console.error('Art order OTP generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP for Art Order Checkout
router.post('/art-order/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase().trim(), 
      otp, 
      type: 'art-order',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Verify art still exists and is available
    const art = await Art.findById(otpRecord.data.artworkId);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    const isAvailable = art.status === 'available' || 
                       (!art.status && art.availability === 'Available');
    
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'This artwork is no longer available for purchase' 
      });
    }

    // Mark OTP as verified (order will be created in artOrders route)
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      orderData: otpRecord.data
    });
  } catch (error) {
    console.error('Art order OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send OTP for Order Tracking
router.post('/order-tracking/otp', async (req, res) => {
  try {
    const { email, orderNumber } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Special case: ART_ORDERS_VIEW - just verify email has orders
    if (orderNumber === 'ART_ORDERS_VIEW') {
      const ArtOrder = require('../models/ArtOrder');
      const orderCount = await ArtOrder.countDocuments({
        email: email.toLowerCase().trim()
      });

      if (orderCount === 0) {
        return res.status(404).json({ message: 'No orders found for this email address.' });
      }
    } else {
      // Regular order tracking - require order number
      if (!orderNumber) {
        return res.status(400).json({ message: 'Order number is required' });
      }

      const ArtOrder = require('../models/ArtOrder');
      const order = await ArtOrder.findOne({
        orderNumber: orderNumber.toUpperCase(),
        email: email.toLowerCase().trim()
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found. Please check your order number and email.' });
      }
    }

    const otp = generateOTP();
    
    const otpRecord = new OTP({
      email: email.toLowerCase().trim(),
      otp,
      type: 'order-tracking',
      data: { orderNumber: orderNumber === 'ART_ORDERS_VIEW' ? 'ART_ORDERS_VIEW' : orderNumber.toUpperCase() },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpRecord.save();

    const emailSent = await sendOTPEmail(email, otp, 'order-tracking');
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent to your email',
      expiresIn: 600
    });
  } catch (error) {
    console.error('Order tracking OTP generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP for Order Tracking
router.post('/order-tracking/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase().trim(), 
      otp, 
      type: 'order-tracking',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    // Special case: ART_ORDERS_VIEW - just verify email, don't fetch specific order
    if (otpRecord.data.orderNumber === 'ART_ORDERS_VIEW') {
      return res.json({
        success: true,
        message: 'Email verified successfully. You can now view your orders.',
        email: email.toLowerCase().trim()
      });
    }

    // Regular order tracking - fetch specific order
    const ArtOrder = require('../models/ArtOrder');
    const order = await ArtOrder.findOne({
      orderNumber: otpRecord.data.orderNumber,
      email: email.toLowerCase().trim()
    }).populate('artworkId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      order: order
    });
  } catch (error) {
    console.error('Order tracking OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

