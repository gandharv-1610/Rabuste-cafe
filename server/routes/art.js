const express = require('express');
const router = express.Router();
const Art = require('../models/Art');

// Get all art pieces
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.availability) {
      filter.availability = req.query.availability;
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
    const art = await Art.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }
    res.json(art);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete art piece (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const art = await Art.findByIdAndDelete(req.params.id);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }
    res.json({ message: 'Art piece deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

