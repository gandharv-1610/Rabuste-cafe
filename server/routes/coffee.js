const express = require('express');
const router = express.Router();
const Coffee = require('../models/Coffee');

// Get all coffee items
router.get('/', async (req, res) => {
  try {
    const coffees = await Coffee.find().sort({ order: 1, createdAt: -1 });
    res.json(coffees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single coffee item
router.get('/:id', async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) {
      return res.status(404).json({ message: 'Coffee not found' });
    }
    res.json(coffee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create coffee item (Admin)
router.post('/', async (req, res) => {
  try {
    const coffee = new Coffee(req.body);
    await coffee.save();
    res.status(201).json(coffee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update coffee item (Admin)
router.put('/:id', async (req, res) => {
  try {
    const coffee = await Coffee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coffee) {
      return res.status(404).json({ message: 'Coffee not found' });
    }
    res.json(coffee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete coffee item (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const coffee = await Coffee.findByIdAndDelete(req.params.id);
    if (!coffee) {
      return res.status(404).json({ message: 'Coffee not found' });
    }
    res.json({ message: 'Coffee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

