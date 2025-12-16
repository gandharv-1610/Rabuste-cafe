const mongoose = require('mongoose');

const franchiseEnquirySchema = new mongoose.Schema({
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
  location: {
    type: String,
    required: true,
    trim: true
  },
  investmentRange: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Rejected'],
    default: 'New'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FranchiseEnquiry', franchiseEnquirySchema);

