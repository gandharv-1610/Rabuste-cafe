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
  cloudinary_url: {
    type: String,
    default: ''
  },
  cloudinary_public_id: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved'],
    default: 'Available'
  },
  category: {
    type: String,
    default: 'General'
  },
  dimensions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Art', artSchema);

