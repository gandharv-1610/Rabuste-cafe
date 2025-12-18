const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  badgeText: {
    type: String,
    trim: true,
    default: '',
  },
  discountValue: {
    type: Number,
    default: 0,
  },
  discountUnit: {
    type: String,
    enum: ['percent', 'flat'],
    default: 'percent',
  },
  terms: {
    type: String,
    trim: true,
    default: '',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  highlight: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Offer', offerSchema);


