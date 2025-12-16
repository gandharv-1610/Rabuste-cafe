const mongoose = require('mongoose');

const coffeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  strength: {
    type: String,
    required: true,
    enum: ['Mild', 'Medium', 'Strong', 'Extra Strong']
  },
  flavorNotes: {
    type: [String],
    default: []
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coffee', coffeeSchema);

