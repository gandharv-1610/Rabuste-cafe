const express = require('express');
const router = express.Router();
const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const Workshop = require('../models/Workshop');
const WorkshopRegistration = require('../models/WorkshopRegistration');
const FranchiseEnquiry = require('../models/FranchiseEnquiry');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const aiInsightsService = require('../services/aiInsightsService');
const { getSubscribedCustomers, getCustomersByTag } = require('../services/customerTagService');
const { sendCoffeeAnnouncementEmail, sendOfferAnnouncementEmail, sendWorkshopAnnouncementEmail, sendBatchMarketingEmails } = require('../services/emailService');

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

// Mark entry payment as paid
router.put('/registrations/:id/mark-paid', async (req, res) => {
  try {
    const registration = await WorkshopRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.paymentStatus !== 'PENDING_ENTRY_PAYMENT') {
      return res.status(400).json({ 
        message: `Cannot mark as paid. Current payment status: ${registration.paymentStatus}` 
      });
    }

    // Update payment status
    registration.paymentStatus = 'PAID_AT_ENTRY';
    await registration.save();

    // Send updated confirmation email
    const workshop = await Workshop.findById(registration.workshopId);
    if (workshop) {
      const { sendWorkshopConfirmationEmail } = require('../services/emailService');
      const { generateGoogleCalendarUrl } = require('../utils/calendar');
      
      let calendarUrl = null;
      if (workshop.date && workshop.time) {
        calendarUrl = generateGoogleCalendarUrl({
          title: workshop.title,
          description: workshop.description || '',
          location: 'Rabuste Coffee',
          startDate: new Date(workshop.date),
          endDate: new Date(new Date(workshop.date).getTime() + (workshop.duration ? parseInt(workshop.duration) * 60000 : 120 * 60000))
        });
      }

      await sendWorkshopConfirmationEmail(registration, workshop, calendarUrl, {
        paymentMethod: registration.paymentMethod,
        paymentStatus: 'PAID_AT_ENTRY',
        amount: registration.amount
      });
    }

    res.json({
      message: 'Payment marked as paid successfully',
      registration: await WorkshopRegistration.findById(req.params.id).populate('workshopId')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search registrations by name or phone (for entry counter)
router.get('/registrations/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const registrations = await WorkshopRegistration.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { confirmationCode: { $regex: query, $options: 'i' } }
      ],
      bookingStatus: 'BOOKED'
    })
      .populate('workshopId')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(registrations);
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

// ============================================
// CUSTOMER ENGAGEMENT ROUTES
// ============================================

// Get customer engagement statistics
router.get('/customer-engagement/stats', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const subscribedCustomers = await Customer.countDocuments({
      marketingConsent: true,
      email: { $exists: true, $ne: '' }
    });
    
    // Get tag breakdown
    const tagCounts = {};
    const tags = ['new_customer', 'returning_customer', 'coffee_lover', 'workshop_interested', 'high_value', 'inactive_30_days'];
    
    for (const tag of tags) {
      const count = await Customer.countDocuments({
        tags: tag,
        marketingConsent: true,
        email: { $exists: true, $ne: '' }
      });
      tagCounts[tag] = count;
    }
    
    const subscribedPercentage = totalCustomers > 0 
      ? ((subscribedCustomers / totalCustomers) * 100).toFixed(1)
      : 0;
    
    res.json({
      totalCustomers,
      subscribedCustomers,
      subscribedPercentage: parseFloat(subscribedPercentage),
      tagBreakdown: tagCounts
    });
  } catch (error) {
    console.error('Customer engagement stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Preview email (for testing)
router.post('/customer-engagement/preview-email', async (req, res) => {
  try {
    const { type, contentId } = req.body;
    
    if (!type || !['coffee', 'offer', 'workshop'].includes(type)) {
      return res.status(400).json({ message: 'Invalid email type' });
    }
    
    // Get a sample customer (first subscribed customer)
    const sampleCustomer = await Customer.findOne({
      marketingConsent: true,
      email: { $exists: true, $ne: '' }
    }).select('name email').lean();
    
    if (!sampleCustomer) {
      return res.status(404).json({ message: 'No subscribed customers found for preview' });
    }
    
    let contentData;
    
    if (type === 'coffee') {
      contentData = await Coffee.findById(contentId);
      if (!contentData) {
        return res.status(404).json({ message: 'Coffee item not found' });
      }
    } else if (type === 'offer') {
      const Offer = require('../models/Offer');
      contentData = await Offer.findById(contentId);
      if (!contentData) {
        return res.status(404).json({ message: 'Offer not found' });
      }
    } else if (type === 'workshop') {
      contentData = await Workshop.findById(contentId);
      if (!contentData) {
        return res.status(404).json({ message: 'Workshop not found' });
      }
    }
    
    // Generate preview HTML (this would be the actual email template)
    res.json({
      success: true,
      message: 'Email preview generated',
      customer: sampleCustomer,
      content: contentData
    });
  } catch (error) {
    console.error('Preview email error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Manual trigger: Send email to all subscribed customers
router.post('/customer-engagement/notify-subscribers', async (req, res) => {
  try {
    const { type, contentId, filterTags } = req.body;
    
    if (!type || !['coffee', 'offer', 'workshop'].includes(type)) {
      return res.status(400).json({ message: 'Invalid email type' });
    }
    
    if (!contentId) {
      return res.status(400).json({ message: 'Content ID is required' });
    }
    
    // Get content data
    let contentData;
    let emailFunction;
    
    if (type === 'coffee') {
      contentData = await Coffee.findById(contentId);
      if (!contentData) {
        return res.status(404).json({ message: 'Coffee item not found' });
      }
      emailFunction = sendCoffeeAnnouncementEmail;
    } else if (type === 'offer') {
      const Offer = require('../models/Offer');
      contentData = await Offer.findById(contentId);
      if (!contentData) {
        return res.status(404).json({ message: 'Offer not found' });
      }
      emailFunction = sendOfferAnnouncementEmail;
    } else if (type === 'workshop') {
      contentData = await Workshop.findById(contentId);
      if (!contentData) {
        return res.status(404).json({ message: 'Workshop not found' });
      }
      emailFunction = sendWorkshopAnnouncementEmail;
    }
    
    // Get customers based on filter tags
    let customers;
    if (filterTags && filterTags.length > 0) {
      customers = await getSubscribedCustomers(filterTags);
    } else {
      customers = await getSubscribedCustomers();
    }
    
    if (customers.length === 0) {
      return res.status(404).json({ message: 'No subscribed customers found' });
    }
    
    // Send emails (async, don't block response)
    sendBatchMarketingEmails(customers, emailFunction, contentData)
      .then(results => {
        console.log(`📧 Manual notification sent: ${results.success}/${results.total} successful`);
      })
      .catch(err => {
        console.error('Error sending manual notification:', err);
      });
    
    res.json({
      success: true,
      message: `Email notification queued for ${customers.length} subscribers`,
      subscribersCount: customers.length
    });
  } catch (error) {
    console.error('Notify subscribers error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

