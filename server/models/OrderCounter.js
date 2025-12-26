const mongoose = require('mongoose');

// Counter to track sequential order numbers
const orderCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 }
});

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

// Sync counter with highest order number in database
async function syncCounterWithDatabase() {
  try {
    const Order = require('./Order');
    
    // Get the highest order number from database
    const highestOrder = await Order.findOne()
      .sort({ orderNumber: -1 })
      .select('orderNumber');
    
    let highestNumber = 0;
    if (highestOrder && highestOrder.orderNumber) {
      // Extract numeric value from padded string (e.g., "00000000001" -> 1)
      highestNumber = parseInt(highestOrder.orderNumber, 10) || 0;
    }
    
    // Get current counter value
    const existingCounter = await OrderCounter.findById('orderNumber');
    const currentCounterValue = existingCounter ? existingCounter.sequence : 0;
    
    // Always ensure counter is at least as high as the highest order
    // This prevents generating numbers that already exist
    if (currentCounterValue < highestNumber) {
      await OrderCounter.findByIdAndUpdate(
        'orderNumber',
        { sequence: highestNumber },
        { upsert: true }
      );
      console.log(`🔄 Order counter resynced from ${currentCounterValue} to ${highestNumber} (highest order in DB)`);
      return highestNumber;
    }
    
    // Counter is already at or above highest order, which is fine
    if (currentCounterValue > highestNumber) {
      console.log(`ℹ️ Counter (${currentCounterValue}) is ahead of highest order (${highestNumber}) - this is normal`);
    }
    
    return currentCounterValue;
  } catch (error) {
    console.error('❌ Error syncing counter:', error);
    // Return 0 as fallback - will be incremented to 1
    return 0;
  }
}

// Function to get next order number
async function getNextOrderNumber() {
  // Always sync counter first to ensure it's up to date
  await syncCounterWithDatabase();
  
  // Use atomic increment to get next number
  // This ensures thread-safe number generation
  const counter = await OrderCounter.findByIdAndUpdate(
    'orderNumber',
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  
  // Ensure we never return 0 - minimum is 1
  const sequenceValue = Math.max(1, counter.sequence);
  if (counter.sequence < 1) {
    // Fix counter if it's less than 1
    await OrderCounter.findByIdAndUpdate(
      'orderNumber',
      { sequence: 1 },
      { upsert: true }
    );
  }
  
  return sequenceValue.toString().padStart(11, '0');
}

// Function to get next token number for today
async function getNextTokenNumber() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const counter = await OrderCounter.findByIdAndUpdate(
    `token_${today.toISOString().split('T')[0]}`,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence;
}

module.exports = { getNextOrderNumber, getNextTokenNumber };

