const express = require('express');
const router = express.Router();
const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const Workshop = require('../models/Workshop');
const WorkshopRegistration = require('../models/WorkshopRegistration');
const FranchiseEnquiry = require('../models/FranchiseEnquiry');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const aiInsightsService = require('../services/aiInsightsService');

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

// Enhanced Order Analytics (with advanced metrics)
router.get('/orders/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analyticsData = await analyticsService.getEnhancedAnalytics(startDate, endDate);
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// AI Insights endpoint
router.get('/analytics/insights', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analyticsData = await analyticsService.getEnhancedAnalytics(startDate, endDate);
    const insights = await aiInsightsService.generateInsights(analyticsData);
    res.json({ insights });
  } catch (error) {
    console.error('AI Insights error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Forecast endpoint
router.get('/analytics/forecast', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const endDateParam = endDate || new Date().toISOString().split('T')[0];
    const analyticsData = await analyticsService.getEnhancedAnalytics(startDate, endDateParam);
    const forecast = await aiInsightsService.generateForecast(analyticsData, new Date(endDateParam));
    res.json({ forecast });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Conversational Analytics endpoint
router.post('/analytics/ask', async (req, res) => {
  try {
    const { query, startDate, endDate } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    const analyticsData = await analyticsService.getEnhancedAnalytics(startDate, endDate);
    const result = await aiInsightsService.answerQuery(query, analyticsData);
    res.json(result);
  } catch (error) {
    console.error('Ask Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Alerts endpoint
router.get('/analytics/alerts', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analyticsData = await analyticsService.getEnhancedAnalytics(startDate, endDate);
    const currentHour = new Date().getHours();
    const alerts = aiInsightsService.generateAlerts(analyticsData, currentHour);
    res.json({ alerts });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

