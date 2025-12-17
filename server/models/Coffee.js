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
  category: {
    type: String,
    enum: ['Coffee', 'Snacks', 'Merchandise', 'Other'],
    default: 'Coffee'
  },
  strength: {
    type: String,
    enum: ['Mild', 'Medium', 'Strong', 'Extra Strong'],
    required: function() {
      return this.category === 'Coffee';
    }
  },
  flavorNotes: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: ''
  },
  cloudinary_url: {
    type: String,
    default: ''
  },
  cloudinary_public_id: {
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

