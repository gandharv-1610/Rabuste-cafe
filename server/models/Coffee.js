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
  // Main category: Coffee, Shakes, Sides
  category: {
    type: String,
    enum: ['Coffee', 'Shakes', 'Sides'],
    required: true,
    trim: true
  },
  // For Coffee category: Hot or Cold
  subcategory: {
    type: String,
    enum: ['Hot', 'Cold', null],
    default: null,
    trim: true
  },
  // For Coffee category: Milk or Non-Milk
  milkType: {
    type: String,
    enum: ['Milk', 'Non-Milk', null],
    default: null,
    trim: true
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
  // For Coffee: Two prices (Blend and Robusta Special) - both optional
  // For Shakes/Sides: Single price
  price: {
    type: Number,
    required: function() {
      return this.category !== 'Coffee';
    },
    min: 0,
    default: 0
  },
  priceBlend: {
    type: Number,
    min: 0,
    default: 0
  },
  priceRobustaSpecial: {
    type: Number,
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

