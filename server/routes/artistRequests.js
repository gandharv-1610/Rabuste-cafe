const express = require('express');
const router = express.Router();
const ArtistRequest = require('../models/ArtistRequest');
const Art = require('../models/Art');
const auth = require('../middleware/auth');
const { sendArtistRequestConfirmationEmail, sendArtistApprovalEmail } = require('../services/emailService');

// Submit artist request
router.post('/submit', async (req, res) => {
  try {
    const {
      artistName,
      email,
      phone,
      artworkTitle,
      medium,
      priceExpectation,
      artworkStory,
      images,
      cloudinary_public_ids
    } = req.body;

    if (!artistName || !email || !phone || !artworkTitle || !medium || !priceExpectation) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one artwork image is required' });
    }

    const request = new ArtistRequest({
      artistName,
      email: email.toLowerCase().trim(),
      phone,
      artworkTitle,
      medium,
      priceExpectation,
      artworkStory: artworkStory || '',
      images: images || [],
      cloudinary_public_ids: cloudinary_public_ids || [],
      status: 'pending'
    });

    await request.save();

    // Send confirmation email
    await sendArtistRequestConfirmationEmail(request);

    res.status(201).json({
      success: true,
      message: 'Artist request submitted successfully',
      request: request
    });
  } catch (error) {
    console.error('Error submitting artist request:', error);
    res.status(500).json({ message: error.message || 'Failed to submit request' });
  }
});

// Get all artist requests (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) filter.status = status;

    const requests = await ArtistRequest.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching artist requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single artist request
router.get('/:id', async (req, res) => {
  try {
    const request = await ArtistRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Artist request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching artist request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Approve artist request and convert to artwork
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const { price, description, dimensions } = req.body;
    const request = await ArtistRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Artist request not found' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ message: 'Request is already approved' });
    }

    if (!price || !description) {
      return res.status(400).json({ message: 'Price and description are required to approve' });
    }

    // Create artwork from request
    const artwork = new Art({
      title: request.artworkTitle,
      artistName: request.artistName,
      description: description,
      price: price,
      image: request.images[0] || '',
      images: request.images || [],
      cloudinary_public_ids: request.cloudinary_public_ids || [],
      medium: request.medium,
      dimensions: dimensions || '',
      artistStory: request.artworkStory || '',
      status: 'available',
      availability: 'Available',
      exhibitedAtRabuste: true,
      category: 'Exhibited'
    });

    await artwork.save();

    // Update request
    request.status = 'approved';
    request.convertedArtworkId = artwork._id;
    await request.save();

    // Send approval email
    await sendArtistApprovalEmail(request, artwork);

    res.json({
      success: true,
      message: 'Artist request approved and artwork created',
      request: request,
      artwork: artwork
    });
  } catch (error) {
    console.error('Error approving artist request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Reject artist request
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await ArtistRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Artist request not found' });
    }

    if (request.status === 'rejected') {
      return res.status(400).json({ message: 'Request is already rejected' });
    }

    request.status = 'rejected';
    if (reason) {
      request.adminNotes = reason;
    }
    await request.save();

    res.json({
      success: true,
      message: 'Artist request rejected',
      request: request
    });
  } catch (error) {
    console.error('Error rejecting artist request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Request more info
router.post('/:id/needs-info', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const request = await ArtistRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Artist request not found' });
    }

    request.status = 'needs_info';
    if (message) {
      request.adminNotes = message;
    }
    await request.save();

    res.json({
      success: true,
      message: 'Request marked as needs more info',
      request: request
    });
  } catch (error) {
    console.error('Error updating artist request:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

