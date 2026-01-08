const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, uploadVideo } = require('../services/cloudinaryService');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const uploadVideoMulter = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Upload image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ 
        message: 'Upload service not configured. Please contact administrator.',
        error: 'Cloudinary credentials missing'
      });
    }

    const folder = req.body.folder || 'rabuste-coffee';
    const result = await uploadImage(req.file.buffer, folder);

    if (!result || !result.url) {
      throw new Error('Upload succeeded but no URL returned');
    }

    res.json({
      url: result.url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    res.status(500).json({ 
      message: 'Upload failed', 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload video
router.post('/video', uploadVideoMulter.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'rabuste-coffee/videos';
    const result = await uploadVideo(req.file.buffer, folder);

    res.json({
      url: result.url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;

