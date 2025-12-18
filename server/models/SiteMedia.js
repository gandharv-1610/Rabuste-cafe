const mongoose = require('mongoose');

// Generic media entries to control images/videos shown in different
// sections of the frontend (e.g. Home hero, story blocks, etc.)
const siteMediaSchema = new mongoose.Schema({
  // Which page this media belongs to (e.g. 'home', 'about', 'coffee', 'art')
  page: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  // Identifier for the exact slot/section on that page
  // e.g. 'home_hero_background', 'home_story_coffee', 'home_story_art'
  section: {
    type: String,
    required: true,
    trim: true,
  },
  // Optional human-readable label for admins
  label: {
    type: String,
    trim: true,
    default: '',
  },
  // 'image' or 'video'
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true,
    default: 'image',
  },
  // The Cloudinary URL that frontend will render
  url: {
    type: String,
    required: true,
  },
  // Raw Cloudinary tracking fields in case you want to delete/replace
  cloudinary_public_id: {
    type: String,
    default: '',
  },
  // Optional helper field to distinguish between different logical uses
  // e.g. 'background', 'thumbnail', 'gallery'
  usage: {
    type: String,
    default: '',
  },
  // Ordering within the same page+section
  order: {
    type: Number,
    default: 0,
  },
  // Whether this media is currently active
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SiteMedia', siteMediaSchema);


