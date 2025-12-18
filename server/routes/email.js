const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const WorkshopRegistration = require('../models/WorkshopRegistration');
const Workshop = require('../models/Workshop');
const FranchiseEnquiry = require('../models/FranchiseEnquiry');
const { generateOTP, sendOTPEmail, sendWorkshopConfirmationEmail, sendFranchiseConfirmationEmail } = require('../services/emailService');
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

    // Create registration
    const confirmationCode = `WRK${Date.now().toString().slice(-6)}`;
    const registration = new WorkshopRegistration({
      ...otpRecord.data,
      email: email.toLowerCase().trim(), // Ensure lowercase
      workshopId: workshop._id,
      confirmationCode
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
    await sendWorkshopConfirmationEmail(registration, workshop, calendarUrl);

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

module.exports = router;

