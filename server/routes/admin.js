const express = require('express');
const router = express.Router();
const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const Workshop = require('../models/Workshop');
const WorkshopRegistration = require('../models/WorkshopRegistration');
const FranchiseEnquiry = require('../models/FranchiseEnquiry');
const Order = require('../models/Order');
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

// Order Analytics
router.get('/orders/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Date range filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of day
        dateFilter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        dateFilter.createdAt.$lte = end;
      }
    } else {
      // Default to last 30 days if no date range specified
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      dateFilter.createdAt = { $gte: start, $lte: end };
    }

    console.log('Analytics date filter:', JSON.stringify(dateFilter, null, 2));

    // Total orders in date range
    const totalOrders = await Order.countDocuments(dateFilter);
    console.log(`Total orders found: ${totalOrders}`);

    // Orders per hour
    const ordersPerHour = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: '$_id',
          count: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      }
    ]);

    // Most ordered items
    const mostOrderedItems = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $project: {
          itemId: '$_id',
          name: 1,
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      }
    ]);

    // Average preparation time
    const avgPrepTime = await Order.aggregate([
      { $match: { ...dateFilter, estimatedPrepTime: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgPrepTime: { $avg: '$estimatedPrepTime' }
        }
      }
    ]);

    // Peak ordering time
    const peakTime = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total revenue
    const totalRevenue = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          subtotal: { $sum: '$subtotal' },
          tax: { $sum: '$tax' }
        }
      }
    ]);

    const response = {
      totalOrders,
      ordersPerHour: ordersPerHour.map(item => ({
        hour: item.hour,
        count: item.count,
        totalRevenue: item.totalRevenue
      })),
      mostOrderedItems: mostOrderedItems.map(item => ({
        itemId: item.itemId,
        name: item.name,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue
      })),
      averagePrepTime: avgPrepTime.length > 0 ? Math.round(avgPrepTime[0].avgPrepTime) : 0,
      peakOrderingTime: peakTime.length > 0 ? peakTime[0]._id : null,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalRevenue: totalRevenue.length > 0 ? {
        total: Math.round(totalRevenue[0].total * 100) / 100,
        subtotal: Math.round(totalRevenue[0].subtotal * 100) / 100,
        tax: Math.round(totalRevenue[0].tax * 100) / 100
      } : { total: 0, subtotal: 0, tax: 0 }
    };
    
    console.log('Analytics response:', {
      totalOrders: response.totalOrders,
      ordersPerHourCount: response.ordersPerHour.length,
      mostOrderedItemsCount: response.mostOrderedItems.length,
      totalRevenue: response.totalRevenue.total
    });
    
    res.json(response);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

