const mongoose = require('mongoose');

const artSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artistName: {
    type: String,
    required: true,
    trim: true
  },
  artistStory: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  cloudinary_url: {
    type: String,
    default: ''
  },
  cloudinary_public_id: {
    type: String,
    default: ''
  },
  cloudinary_public_ids: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved'],
    default: 'Available'
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'in_cafe'],
    default: 'available'
  },
  isOfflineAvailable: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General'
  },
  dimensions: {
    type: String,
    default: ''
  },
  medium: {
    type: String,
    default: ''
  },
  exhibitedAtRabuste: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Art', artSchema);

