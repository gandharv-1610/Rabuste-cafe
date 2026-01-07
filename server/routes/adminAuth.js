const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[Admin Login] Attempting login for email: ${normalizedEmail}`);

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      console.log(`[Admin Login] Admin not found for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`[Admin Login] Admin found, comparing password...`);
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      console.log(`[Admin Login] Password mismatch for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: admin._id };
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('[Admin Login] JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is not set' });
    }

    const token = jwt.sign(payload, secret, {
      expiresIn: '7d',
    });

    console.log(`[Admin Login] Successfully logged in: ${normalizedEmail}`);
    return res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('[Admin Login] Error:', error);
    console.error('[Admin Login] Error stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// POST /api/admin/auth/change-password (protected)
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


