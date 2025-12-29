const mongoose = require('mongoose');

const preOrderSettingsSchema = new mongoose.Schema({
  isEnabled: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: "Currently we're not accepting any preorder. Kindly check later."
  },
  customerSupportNumber: {
    type: String,
    default: 'XXX-XXX-XXXX'
  },
  updatedBy: {
    type: String,
    default: 'admin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
preOrderSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('PreOrderSettings', preOrderSettingsSchema);

