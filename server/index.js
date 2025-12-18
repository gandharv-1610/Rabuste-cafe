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

mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/coffee', require('./routes/coffee'));
app.use('/api/art', require('./routes/art'));
app.use('/api/workshops', require('./routes/workshops'));
app.use('/api/franchise', require('./routes/franchise'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/email', require('./routes/email'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/site-media', require('./routes/siteMedia'));
app.use('/api/offers', require('./routes/offers'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Rabuste Coffee API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

