const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Coffee = require('../models/Coffee');

/**
 * Build date filter for analytics queries
 */
function buildDateFilter(startDate, endDate) {
  const dateFilter = {};
  
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.createdAt.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = end;
    }
  } else {
    // Default to last 30 days
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    dateFilter.createdAt = { $gte: start, $lte: end };
  }
  
  return dateFilter;
}

/**
 * Get comparison data for previous period (same length as current period)
 */
async function getPreviousPeriodData(startDate, endDate) {
  const currentStart = new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const currentEnd = new Date(endDate || new Date());
  
  const periodLength = currentEnd - currentStart;
  const previousEnd = new Date(currentStart);
  previousEnd.setTime(previousEnd.getTime() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setTime(previousStart.getTime() - periodLength);
  
  previousStart.setHours(0, 0, 0, 0);
  previousEnd.setHours(23, 59, 59, 999);
  
  const dateFilter = {
    createdAt: { $gte: previousStart, $lte: previousEnd },
    paymentStatus: 'Paid'
  };
  
  const totalOrders = await Order.countDocuments(dateFilter);
  const revenueData = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' }
      }
    }
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
  
  const avgPrepTimeData = await Order.aggregate([
    { $match: { ...dateFilter, estimatedPrepTime: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        avgPrepTime: { $avg: '$estimatedPrepTime' }
      }
    }
  ]);
  const avgPrepTime = avgPrepTimeData.length > 0 ? Math.round(avgPrepTimeData[0].avgPrepTime) : 0;
  
  return { totalOrders, totalRevenue, avgPrepTime };
}

/**
 * Get enhanced analytics data
 */
async function getEnhancedAnalytics(startDate, endDate) {
  const dateFilter = buildDateFilter(startDate, endDate);
  dateFilter.paymentStatus = 'Paid';
  
  // Basic metrics
  const totalOrders = await Order.countDocuments(dateFilter);
  
  const totalRevenueData = await Order.aggregate([
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
  const totalRevenue = totalRevenueData.length > 0 ? {
    total: Math.round(totalRevenueData[0].total * 100) / 100,
    subtotal: Math.round(totalRevenueData[0].subtotal * 100) / 100,
    tax: Math.round(totalRevenueData[0].tax * 100) / 100
  } : { total: 0, subtotal: 0, tax: 0 };
  
  const avgPrepTimeData = await Order.aggregate([
    { $match: { ...dateFilter, estimatedPrepTime: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        avgPrepTime: { $avg: '$estimatedPrepTime' }
      }
    }
  ]);
  const averagePrepTime = avgPrepTimeData.length > 0 ? Math.round(avgPrepTimeData[0].avgPrepTime) : 0;
  
  // Orders per hour with revenue and prep time
  const ordersPerHour = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        avgPrepTime: { $avg: '$estimatedPrepTime' }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        hour: '$_id',
        count: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        avgPrepTime: { $round: ['$avgPrepTime', 1] }
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
  const peakOrderingTime = peakTime.length > 0 ? peakTime[0]._id : null;
  
  // Most ordered items
  const mostOrderedItems = await Order.aggregate([
    { $match: dateFilter },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.itemId',
        name: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        avgPrepTime: { $avg: '$items.prepTime' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
    {
      $project: {
        itemId: '$_id',
        name: 1,
        totalQuantity: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        avgPrepTime: { $round: ['$avgPrepTime', 1] }
      }
    }
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
  const ordersByStatusMap = ordersByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  // Revenue breakdown by order source (Dine-in vs Takeaway)
  // tableNumber presence indicates dine-in, empty/null = takeaway
  const revenueBySource = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          $cond: [
            { $and: [{ $ne: ['$tableNumber', null] }, { $ne: ['$tableNumber', ''] }] },
            'Dine-in',
            'Takeaway'
          ]
        },
        revenue: { $sum: '$total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
  
  // Revenue breakdown by category
  const revenueByCategory = await Order.aggregate([
    { $match: dateFilter },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'coffees',
        localField: 'items.itemId',
        foreignField: '_id',
        as: 'itemDetails'
      }
    },
    { $unwind: '$itemDetails' },
    {
      $group: {
        _id: '$itemDetails.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        quantity: { $sum: '$items.quantity' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
  
  // Customer behavior: New vs Returning
  const customerOrders = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$customer',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        firstOrderDate: { $min: '$createdAt' }
      }
    }
  ]);
  
  let newCustomers = 0;
  let returningCustomers = 0;
  let totalCustomerRevenue = 0;
  
  for (const customerOrder of customerOrders) {
    // Check if this is their first order ever (not just in this period)
    const allCustomerOrders = await Order.countDocuments({ customer: customerOrder._id });
    if (allCustomerOrders === customerOrder.orderCount) {
      newCustomers++;
    } else {
      returningCustomers++;
    }
    totalCustomerRevenue += customerOrder.totalSpent;
  }
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue.total / totalOrders : 0;
  
  // Popular items by time slot (Morning: 6-12, Afternoon: 12-18, Evening: 18-24)
  const popularItemsByTimeSlot = await Order.aggregate([
    { $match: dateFilter },
    { $unwind: '$items' },
    {
      $project: {
        hour: { $hour: '$createdAt' },
        itemId: '$items.itemId',
        itemName: '$items.name',
        quantity: '$items.quantity',
        timeSlot: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: [{ $hour: '$createdAt' }, 6] }, { $lt: [{ $hour: '$createdAt' }, 12] }] }, then: 'Morning' },
              { case: { $and: [{ $gte: [{ $hour: '$createdAt' }, 12] }, { $lt: [{ $hour: '$createdAt' }, 18] }] }, then: 'Afternoon' },
              { case: { $and: [{ $gte: [{ $hour: '$createdAt' }, 18] }, { $lt: [{ $hour: '$createdAt' }, 24] }] }, then: 'Evening' }
            ],
            default: 'Late Night'
          }
        }
      }
    },
    {
      $group: {
        _id: { timeSlot: '$timeSlot', itemId: '$itemId', itemName: '$itemName' },
        quantity: { $sum: '$quantity' }
      }
    },
    { $sort: { '_id.timeSlot': 1, quantity: -1 } },
    {
      $group: {
        _id: '$_id.timeSlot',
        topItems: {
          $push: {
            itemId: '$_id.itemId',
            name: '$_id.itemName',
            quantity: '$quantity'
          }
        }
      }
    },
    {
      $project: {
        timeSlot: '$_id',
        topItems: { $slice: ['$topItems', 5] }
      }
    },
    { $sort: { timeSlot: 1 } }
  ]);
  
  // Prep time by hour
  const prepTimeByHour = await Order.aggregate([
    { $match: { ...dateFilter, estimatedPrepTime: { $gt: 0 } } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        avgPrepTime: { $avg: '$estimatedPrepTime' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        hour: '$_id',
        avgPrepTime: { $round: ['$avgPrepTime', 1] },
        count: 1
      }
    }
  ]);
  
  // Prep time per item (to identify slow items)
  const prepTimePerItem = await Order.aggregate([
    { $match: { ...dateFilter, estimatedPrepTime: { $gt: 0 } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.itemId',
        itemName: { $first: '$items.name' },
        avgPrepTime: { $avg: '$items.prepTime' },
        orderCount: { $sum: 1 },
        totalQuantity: { $sum: '$items.quantity' }
      }
    },
    { $sort: { avgPrepTime: -1 } },
    { $limit: 10 },
    {
      $project: {
        itemId: '$_id',
        itemName: 1,
        avgPrepTime: { $round: ['$avgPrepTime', 1] },
        orderCount: 1,
        totalQuantity: 1
      }
    }
  ]);
  
  // Peak revenue hour
  const peakRevenueHour = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 1 }
  ]);
  
  // Get previous period data for comparison
  const previousPeriod = await getPreviousPeriodData(startDate, endDate);
  
  return {
    totalOrders,
    totalRevenue,
    averagePrepTime,
    ordersPerHour,
    peakOrderingTime,
    mostOrderedItems,
    ordersByStatus: ordersByStatusMap,
    revenueBreakdown: {
      bySource: revenueBySource,
      byCategory: revenueByCategory
    },
    customerBehavior: {
      newCustomers,
      returningCustomers,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      popularItemsByTimeSlot
    },
    prepTimeIntelligence: {
      byHour: prepTimeByHour,
      perItem: prepTimePerItem
    },
    peakRevenueHour: peakRevenueHour.length > 0 ? peakRevenueHour[0]._id : null,
    previousPeriod
  };
}

module.exports = {
  getEnhancedAnalytics,
  buildDateFilter,
  getPreviousPeriodData
};

