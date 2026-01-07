const DailyOffer = require('../models/DailyOffer');

/**
 * Clean up expired and inactive daily offers
 * Deletes offers that are:
 * 1. Inactive (isActive: false)
 * 2. Past their end date (endDate < now)
 */
async function cleanupDailyOffers() {
  try {
    const now = new Date();
    
    // Find offers to delete
    const offersToDelete = await DailyOffer.find({
      $or: [
        { isActive: false }, // Inactive/deleted offers
        { endDate: { $lt: now } } // Expired offers (past end date)
      ]
    });

    if (offersToDelete.length === 0) {
      console.log('🧹 No daily offers to clean up');
      return { deleted: 0, message: 'No offers to clean up' };
    }

    // Delete the offers
    const result = await DailyOffer.deleteMany({
      $or: [
        { isActive: false },
        { endDate: { $lt: now } }
      ]
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} daily offer(s):`);
    console.log(`   - Inactive offers: ${offersToDelete.filter(o => !o.isActive).length}`);
    console.log(`   - Expired offers: ${offersToDelete.filter(o => o.isActive && o.endDate < now).length}`);

    return {
      deleted: result.deletedCount,
      message: `Cleaned up ${result.deletedCount} offer(s)`
    };
  } catch (error) {
    console.error('❌ Error cleaning up daily offers:', error);
    throw error;
  }
}

/**
 * Run cleanup on a schedule (daily at midnight)
 */
function scheduleDailyCleanup() {
  // Calculate milliseconds until next midnight
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  midnight.setMinutes(0);
  midnight.setSeconds(0);
  midnight.setMilliseconds(0);
  const msUntilMidnight = midnight - now;

  // Schedule first run at midnight
  setTimeout(() => {
    // Run cleanup at midnight
    cleanupDailyOffers().catch(err => {
      console.error('Error in scheduled cleanup:', err);
    });

    // Then schedule it to run every 24 hours
    setInterval(() => {
      cleanupDailyOffers().catch(err => {
        console.error('Error in scheduled cleanup:', err);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }, msUntilMidnight);

  const nextRun = new Date(Date.now() + msUntilMidnight);
  console.log(`⏰ Daily offer cleanup scheduled (next run: ${nextRun.toLocaleString()})`);
}

module.exports = {
  cleanupDailyOffers,
  scheduleDailyCleanup
};

