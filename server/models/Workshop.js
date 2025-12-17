const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Coffee Workshop', 'Art & Creativity Workshop', 'Community Session']
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '2 hours'
  },
  maxSeats: {
    type: Number,
    required: true,
    min: 1
  },
  bookedSeats: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  instructor: {
    type: String,
    default: ''
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
  video_url: {
    type: String,
    default: ''
  },
  cloudinary_video_public_id: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workshop', workshopSchema);

