const mongoose = require('mongoose');

const workshopRegistrationSchema = new mongoose.Schema({
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  confirmationCode: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add compound unique index to prevent duplicate registrations (email + workshopId)
// Only for non-cancelled registrations
workshopRegistrationSchema.index(
  { email: 1, workshopId: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $ne: 'Cancelled' } }
  }
);

module.exports = mongoose.model('WorkshopRegistration', workshopRegistrationSchema);

