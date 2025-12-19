// One-time script to create an initial admin user if none exists
// Usage: node scripts/seedAdmin.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rabuste-coffee';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne();
    if (existing) {
      console.log(`Admin already exists with email: ${existing.email}`);
      await mongoose.disconnect();
      return;
    }

    const defaultEmail = process.env.ADMIN_SEED_EMAIL || 'admin@rabuste.coffee';
    const defaultPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeMeNow!123';

    const admin = new Admin({
      email: defaultEmail,
      password: defaultPassword, // will be hashed by pre-save hook
    });

    await admin.save();
    console.log('Admin user created:');
    console.log(`  Email   : ${defaultEmail}`);
    console.log('  Password: (from ADMIN_SEED_PASSWORD env or default placeholder)');
    console.log('IMPORTANT: Change this password immediately after first login.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exitCode = 1;
  }
}

seedAdmin();


