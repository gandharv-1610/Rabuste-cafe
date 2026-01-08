const express = require('express');
const router = express.Router();
const Art = require('../models/Art');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

// Get all art pieces
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.availability === 'Sold') {
      // When filtering by 'Sold', show only sold paintings
      // Check both availability field and status field for backward compatibility
      filter.$or = [
        { availability: 'Sold' },
        { status: 'sold' }
      ];
    } else if (req.query.availability === 'Available') {
      // When filtering by 'Available', show Available and Reserved paintings
      // Explicitly exclude Sold items
      // Check both availability field and status field for backward compatibility
      filter.$and = [
        {
          $or: [
            { availability: 'Available' },
            { availability: 'Reserved' },
            { status: 'available' },
            { status: 'reserved' },
            { status: 'in_cafe' }
          ]
        },
        {
          $nor: [
            { availability: 'Sold' },
            { status: 'sold' }
          ]
        }
      ];
    } else {
      // When filter is 'all' or no filter, show ALL arts (sold, reserved, and available)
      // No filter applied - return everything
    }
    const arts = await Art.find(filter).sort({ createdAt: -1 });
    res.json(arts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single art piece
router.get('/:id', async (req, res) => {
  try {
    const art = await Art.findById(req.params.id);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }
    res.json(art);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create art piece (Admin)
router.post('/', async (req, res) => {
  try {
    const art = new Art(req.body);
    await art.save();
    res.status(201).json(art);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update art piece (Admin)
router.put('/:id', async (req, res) => {
  try {
    const existing = await Art.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    // If Cloudinary image changed, delete old one
    if (
      req.body.cloudinary_public_id &&
      existing.cloudinary_public_id &&
      req.body.cloudinary_public_id !== existing.cloudinary_public_id
    ) {
      try {
        await deleteFromCloudinary(existing.cloudinary_public_id, 'image');
      } catch (err) {
        console.error('Error deleting old art image from Cloudinary:', err);
      }
    }

    const art = await Art.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(art);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete art piece (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const art = await Art.findById(req.params.id);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    if (art.cloudinary_public_id) {
      try {
        await deleteFromCloudinary(art.cloudinary_public_id, 'image');
      } catch (err) {
        console.error('Error deleting art image from Cloudinary:', err);
      }
    }

    await Art.findByIdAndDelete(req.params.id);
    res.json({ message: 'Art piece deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

