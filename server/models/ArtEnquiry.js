const mongoose = require('mongoose');

const artEnquirySchema = new mongoose.Schema({
  artId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Art',
    required: true
  },
  name: {
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
  message: {
    type: String,
    default: ''
  },
  enquiryType: {
    type: String,
    enum: ['Purchase', 'Information'],
    default: 'Information'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Progress', 'Resolved', 'Rejected'],
    default: 'New'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArtEnquiry', artEnquirySchema);

