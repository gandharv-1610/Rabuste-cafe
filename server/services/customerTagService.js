const Customer = require('../models/Customer');
const Order = require('../models/Order');
const WorkshopRegistration = require('../models/WorkshopRegistration');

/**
 * Auto-generate customer tags based on behavior
 * Tags help segment customers for targeted email marketing
 * 
 * Tags:
 * - "new_customer" → first order
 * - "returning_customer" → more than 1 order
 * - "coffee_lover" → majority coffee orders
 * - "workshop_interested" → registered for any workshop
 * - "high_value" → totalSpent > threshold (default: ₹5000)
 * - "inactive_30_days" → no order in last 30 days
 */
const HIGH_VALUE_THRESHOLD = process.env.HIGH_VALUE_THRESHOLD || 5000; // ₹5000 default

/**
 * Calculate and update customer tags
 * This should be called after order creation or periodically
 */
const updateCustomerTags = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId).populate('orders');
    if (!customer) {
      console.error(`Customer ${customerId} not found for tag update`);
      return;
    }

    const tags = new Set();

    // new_customer vs returning_customer
    if (customer.totalOrders === 1) {
      tags.add('new_customer');
    } else if (customer.totalOrders > 1) {
      tags.add('returning_customer');
    }

    // coffee_lover - check if majority of orders are coffee
    if (customer.orders && customer.orders.length > 0) {
      const orders = await Order.find({ customer: customerId })
        .populate('items.itemId', 'category');
      
      let coffeeItemCount = 0;
      let totalItemCount = 0;

      orders.forEach(order => {
        order.items.forEach(item => {
          totalItemCount += item.quantity;
          if (item.itemId && item.itemId.category === 'Coffee') {
            coffeeItemCount += item.quantity;
          }
        });
      });

      // If more than 50% of items are coffee, tag as coffee_lover
      if (totalItemCount > 0 && (coffeeItemCount / totalItemCount) > 0.5) {
        tags.add('coffee_lover');
      }
    }

    // workshop_interested - check if registered for any workshop
    const workshopRegistrations = await WorkshopRegistration.find({
      email: customer.email,
      status: { $ne: 'Cancelled' }
    });

    if (workshopRegistrations.length > 0) {
      tags.add('workshop_interested');
    }

    // high_value - check total spent
    if (customer.totalSpent >= HIGH_VALUE_THRESHOLD) {
      tags.add('high_value');
    }

    // inactive_30_days - check last order date
    if (customer.lastOrderDate) {
      const daysSinceLastOrder = Math.floor(
        (new Date() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastOrder >= 30) {
        tags.add('inactive_30_days');
      }
    }

    // Update customer tags
    customer.tags = Array.from(tags);
    await customer.save();

    console.log(`✅ Updated tags for customer ${customer.mobile}: ${Array.from(tags).join(', ')}`);
    return Array.from(tags);
  } catch (error) {
    console.error('Error updating customer tags:', error);
    return [];
  }
};

/**
 * Get customers by tag for targeted email campaigns
 */
const getCustomersByTag = async (tag, requireConsent = true) => {
  try {
    const query = {
      tags: tag
    };

    // Only return customers who have given marketing consent
    if (requireConsent) {
      query.marketingConsent = true;
      query.email = { $exists: true, $ne: '' };
    }

    const customers = await Customer.find(query)
      .select('name email mobile tags marketingConsent subscribedAt')
      .lean();

    return customers;
  } catch (error) {
    console.error(`Error getting customers by tag ${tag}:`, error);
    return [];
  }
};

/**
 * Get all customers with marketing consent
 */
const getSubscribedCustomers = async (filterTags = []) => {
  try {
    const query = {
      marketingConsent: true,
      email: { $exists: true, $ne: '' }
    };

    // Filter by tags if provided
    if (filterTags.length > 0) {
      query.tags = { $in: filterTags };
    }

    const customers = await Customer.find(query)
      .select('name email mobile tags marketingConsent subscribedAt')
      .lean();

    return customers;
  } catch (error) {
    console.error('Error getting subscribed customers:', error);
    return [];
  }
};

module.exports = {
  updateCustomerTags,
  getCustomersByTag,
  getSubscribedCustomers,
  HIGH_VALUE_THRESHOLD
};

