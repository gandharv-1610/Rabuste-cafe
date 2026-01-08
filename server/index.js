const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

console.log('🔄 Connecting to MongoDB...');
if (MONGODB_URI.includes('mongodb+srv://')) {
  console.log('   Using MongoDB Atlas (cloud)');
} else {
  console.log('   Using local MongoDB');
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('✅ MongoDB Connected');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Clean up expired and inactive daily offers on startup
    try {
      const { cleanupDailyOffers, scheduleDailyCleanup } = require('./services/dailyOfferCleanupService');
      await cleanupDailyOffers();
      scheduleDailyCleanup();
    } catch (error) {
      console.error('⚠️  Error setting up daily offer cleanup:', error.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('\n📋 Troubleshooting Steps:');
    
    if (MONGODB_URI.includes('mongodb+srv://')) {
      console.error('   For MongoDB Atlas:');
      console.error('   1. Check if your IP is whitelisted in MongoDB Atlas Network Access');
      console.error('   2. Verify username and password are correct');
      console.error('   3. Ensure the cluster is not paused (free tier clusters pause after inactivity)');
      console.error('   4. Check database name is included in connection string');
      console.error('   5. Verify connection string format: mongodb+srv://user:pass@cluster.mongodb.net/database');
    } else {
      console.error('   For Local MongoDB:');
      console.error('   1. Ensure MongoDB service is running: mongod');
      console.error('   2. Check if MongoDB is listening on port 27017');
      console.error('   3. Verify connection string format: mongodb://localhost:27017/database');
    }
    
    console.error('\n   Connection String (password hidden):', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.error('   Full error details:', err);
    process.exit(1);
  });

// Routes
try {
  console.log('🔄 Loading routes...');
  app.use('/api/coffee', require('./routes/coffee'));
  app.use('/api/art', require('./routes/art'));
  app.use('/api/art-orders', require('./routes/artOrders'));
  app.use('/api/artist-requests', require('./routes/artistRequests'));
  app.use('/api/workshops', require('./routes/workshops'));
  app.use('/api/franchise', require('./routes/franchise'));
  app.use('/api/admin/auth', require('./routes/adminAuth')); // public login
  app.use('/api/admin', require('./routes/admin')); // protected admin routes
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/email', require('./routes/email'));
  app.use('/api/upload', require('./routes/upload'));
  app.use('/api/site-media', require('./routes/siteMedia'));
  app.use('/api/offers', require('./routes/offers'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/customers', require('./routes/customers'));
  app.use('/api/payment', require('./routes/payment'));
  app.use('/api/billing', require('./routes/billing'));
  console.log('✅ All routes loaded');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rabuste Coffee API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Database status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

