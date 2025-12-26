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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rabuste-coffee';

console.log('🔄 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('   Please check your MONGODB_URI in .env file');
    console.error('   Full error:', err);
    process.exit(1);
  });

// Routes
try {
  console.log('🔄 Loading routes...');
  app.use('/api/coffee', require('./routes/coffee'));
  app.use('/api/art', require('./routes/art'));
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
  app.use('/api/payment', require('./routes/payment'));
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

