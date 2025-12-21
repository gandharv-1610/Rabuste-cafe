const express = require('express');
const router = express.Router();
const SiteMedia = require('../models/SiteMedia');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

// Get media entries, optionally filtered by page and/or section
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.page) {
      // Ensure page is lowercase and trimmed
      filter.page = req.query.page.toLowerCase().trim();
    }
    if (req.query.section) {
      // Ensure section is trimmed
      filter.section = req.query.section.trim();
    }
    if (req.query.isActive === 'true') {
      filter.isActive = true;
    }

    // Log the filter for debugging
    console.log('SiteMedia GET - Filter:', filter);
    
    const media = await SiteMedia.find(filter).sort({ order: 1, createdAt: -1 });
    
    // Log results for debugging
    console.log(`SiteMedia GET - Found ${media.length} entries for page: ${filter.page || 'all'}`);
    
    res.json(media);
  } catch (error) {
    console.error('SiteMedia GET Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create media entry (Admin)
router.post('/', async (req, res) => {
  try {
    // Normalize the page field before creating
    const mediaData = {
      ...req.body,
      page: req.body.page ? req.body.page.toLowerCase().trim() : req.body.page,
      section: req.body.section ? req.body.section.trim() : req.body.section,
    };
    
    // Log what we're receiving and saving
    console.log('SiteMedia POST - Received data:', {
      page: req.body.page,
      section: req.body.section,
      normalizedPage: mediaData.page,
    });
    
    const media = new SiteMedia(mediaData);
    
    // Log before save
    console.log('SiteMedia POST - Before save:', {
      page: media.page,
      section: media.section,
    });
    
    await media.save();
    
    // Log after save
    console.log('SiteMedia POST - After save:', {
      page: media.page,
      section: media.section,
      id: media._id,
    });
    
    res.status(201).json(media);
  } catch (error) {
    console.error('SiteMedia POST Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update media entry (Admin)
router.put('/:id', async (req, res) => {
  try {
    const existing = await SiteMedia.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Media entry not found' });
    }

    // Normalize the page field before updating
    const updateData = {
      ...req.body,
      page: req.body.page ? req.body.page.toLowerCase().trim() : req.body.page,
      section: req.body.section ? req.body.section.trim() : req.body.section,
    };
    
    // Log what we're updating
    console.log('SiteMedia PUT - Updating:', {
      id: req.params.id,
      existingPage: existing.page,
      newPage: req.body.page,
      normalizedPage: updateData.page,
    });

    if (
      updateData.cloudinary_public_id &&
      existing.cloudinary_public_id &&
      updateData.cloudinary_public_id !== existing.cloudinary_public_id
    ) {
      try {
        await deleteFromCloudinary(
          existing.cloudinary_public_id,
          existing.mediaType === 'video' ? 'video' : 'image'
        );
      } catch (err) {
        console.error('Error deleting old site media from Cloudinary:', err);
      }
    }

    const updated = await SiteMedia.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('SiteMedia PUT - Updated:', {
      id: updated._id,
      page: updated.page,
      section: updated.section,
    });
    
    res.json(updated);
  } catch (error) {
    console.error('SiteMedia PUT Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete media entry (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const media = await SiteMedia.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media entry not found' });
    }

    if (media.cloudinary_public_id) {
      try {
        await deleteFromCloudinary(
          media.cloudinary_public_id,
          media.mediaType === 'video' ? 'video' : 'image'
        );
      } catch (err) {
        console.error('Error deleting site media from Cloudinary:', err);
      }
    }

    await SiteMedia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


