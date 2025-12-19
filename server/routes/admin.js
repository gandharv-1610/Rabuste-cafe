const express = require('express');
const router = express.Router();
const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const Workshop = require('../models/Workshop');
const WorkshopRegistration = require('../models/WorkshopRegistration');
const FranchiseEnquiry = require('../models/FranchiseEnquiry');
const auth = require('../middleware/auth');

// All admin routes below this line require valid admin JWT
router.use(auth);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      coffee: await Coffee.countDocuments(),
      art: await Art.countDocuments(),
      workshops: await Workshop.countDocuments(),
      activeWorkshops: await Workshop.countDocuments({ isActive: true }),
      registrations: await WorkshopRegistration.countDocuments(),
      franchiseEnquiries: await FranchiseEnquiry.countDocuments(),
      newEnquiries: await FranchiseEnquiry.countDocuments({ status: 'New' })
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    // Popular coffees (can be enhanced with view/order tracking)
    const popularCoffees = await Coffee.find({ isBestseller: true });
    
    // Workshop demand
    const workshops = await Workshop.find();
    const workshopDemand = workshops.map(w => ({
      title: w.title,
      bookedSeats: w.bookedSeats,
      maxSeats: w.maxSeats,
      fillRate: ((w.bookedSeats / w.maxSeats) * 100).toFixed(1)
    }));

    // Art interest (can track views/clicks)
    const availableArt = await Art.find({ availability: 'Available' });
    const soldArt = await Art.find({ availability: 'Sold' });

    res.json({
      popularCoffees,
      workshopDemand,
      artStats: {
        available: availableArt.length,
        sold: soldArt.length,
        totalValue: soldArt.reduce((sum, art) => sum + art.price, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all registrations
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await WorkshopRegistration.find()
      .populate('workshopId')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete registration
router.delete('/registrations/:id', async (req, res) => {
  try {
    const registration = await WorkshopRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Decrease booked seats for the workshop
    if (registration.workshopId) {
      const workshop = await Workshop.findById(registration.workshopId);
      if (workshop && workshop.bookedSeats > 0) {
        workshop.bookedSeats -= 1;
        await workshop.save();
      }
    }

    await WorkshopRegistration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

