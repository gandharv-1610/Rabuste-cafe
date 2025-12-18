const express = require('express');
const router = express.Router();
const SiteMedia = require('../models/SiteMedia');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

// Get media entries, optionally filtered by page and/or section
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.page) {
      filter.page = req.query.page.toLowerCase();
    }
    if (req.query.section) {
      filter.section = req.query.section;
    }
    if (req.query.isActive === 'true') {
      filter.isActive = true;
    }

    const media = await SiteMedia.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create media entry (Admin)
router.post('/', async (req, res) => {
  try {
    const media = new SiteMedia(req.body);
    await media.save();
    res.status(201).json(media);
  } catch (error) {
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

    if (
      req.body.cloudinary_public_id &&
      existing.cloudinary_public_id &&
      req.body.cloudinary_public_id !== existing.cloudinary_public_id
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
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
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


