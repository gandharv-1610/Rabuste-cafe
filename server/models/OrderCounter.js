const mongoose = require('mongoose');

// Counter to track sequential order numbers
const orderCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 }
});

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

// Function to get next order number
async function getNextOrderNumber() {
  const counter = await OrderCounter.findByIdAndUpdate(
    'orderNumber',
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence.toString().padStart(11, '0');
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

