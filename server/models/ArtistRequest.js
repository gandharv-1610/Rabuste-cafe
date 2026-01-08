const mongoose = require('mongoose');

const artistRequestSchema = new mongoose.Schema({
  artistName: {
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
  artworkTitle: {
    type: String,
    required: true,
    trim: true
  },
  medium: {
    type: String,
    required: true,
    trim: true
  },
  priceExpectation: {
    type: Number,
    required: true,
    min: 0
  },
  artworkStory: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  cloudinary_public_ids: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_info'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  convertedArtworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Art',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArtistRequest', artistRequestSchema);

