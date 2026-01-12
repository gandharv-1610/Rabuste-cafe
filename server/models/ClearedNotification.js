const mongoose = require('mongoose');

const ClearedNotificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  notificationType: {
    type: String,
    enum: ['franchise', 'art-enquiry', 'art-order', 'artist-request'],
    required: true
  },
  clearedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
ClearedNotificationSchema.index({ notificationId: 1 });

module.exports = mongoose.model('ClearedNotification', ClearedNotificationSchema);
