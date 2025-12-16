const express = require('express');
const router = express.Router();
const FranchiseEnquiry = require('../models/FranchiseEnquiry');

// Submit franchise enquiry
router.post('/enquiry', async (req, res) => {
  try {
    const enquiry = new FranchiseEnquiry(req.body);
    await enquiry.save();
    res.status(201).json({
      message: 'Franchise enquiry submitted successfully',
      enquiry
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all enquiries (Admin)
router.get('/enquiries', async (req, res) => {
  try {
    const enquiries = await FranchiseEnquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single enquiry (Admin)
router.get('/enquiries/:id', async (req, res) => {
  try {
    const enquiry = await FranchiseEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update enquiry status (Admin)
router.put('/enquiries/:id', async (req, res) => {
  try {
    const enquiry = await FranchiseEnquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

