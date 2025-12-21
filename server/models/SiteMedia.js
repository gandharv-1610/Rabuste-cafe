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
    index: true, // Add index for faster queries
  },
  // Identifier for the exact slot/section on that page
  // e.g. 'home_hero_background', 'home_story_coffee', 'home_story_art'
  section: {
    type: String,
    required: true,
    trim: true,
    index: true, // Add index for faster queries
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
    index: true, // Add index for faster queries
  },
}, {
  timestamps: true,
});

// Pre-save hook to ensure page is always lowercase (in case it wasn't before)
siteMediaSchema.pre('save', function(next) {
  // Only normalize if page exists and is not already the correct value
  if (this.page && typeof this.page === 'string') {
    const normalized = this.page.toLowerCase().trim();
    console.log('SiteMedia pre-save - Normalizing page:', {
      original: this.page,
      normalized: normalized,
      isModified: this.isModified('page'),
    });
    this.page = normalized;
  }
  if (this.section && typeof this.section === 'string') {
    this.section = this.section.trim();
  }
  next();
});

// Pre-update hook to ensure page is always lowercase on updates
siteMediaSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function(next) {
  if (this.getUpdate().page) {
    this.getUpdate().page = this.getUpdate().page.toLowerCase().trim();
  }
  if (this.getUpdate().section) {
    this.getUpdate().section = this.getUpdate().section.trim();
  }
  next();
});

module.exports = mongoose.model('SiteMedia', siteMediaSchema);


