# Installation & Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email service)
- Cloudinary account (for media storage)
- Google Gemini API key

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Set Up Environment Variables

### Server Environment (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rabuste-coffee

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (Nodemailer with Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client Environment (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_HERO_VIDEO_URL=https://res.cloudinary.com/your_cloud/video/upload/v1234567/hero-video.mp4
REACT_APP_BREWING_VIDEO_URL=https://res.cloudinary.com/your_cloud/video/upload/v1234567/brewing-process.mp4
```

## Step 3: Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Use this password in `EMAIL_PASS` (not your regular Gmail password)

## Step 4: Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Upload your hero video and brewing process video
4. Copy the secure URLs to your `client/.env`

## Step 5: Start the Application

```bash
# From root directory
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend on http://localhost:3000

## Step 6: Test Features

1. **Email OTP**: Submit a workshop registration or franchise enquiry
2. **Image Upload**: Add a menu item in Admin Panel with photo
3. **Video Background**: Check home page hero section
4. **Chatbot**: Test with and without API key (fallback should work)
5. **Google Calendar**: Register for a workshop and click "Add to Google Calendar"

## Troubleshooting

### Email Not Sending
- Verify Gmail App Password is correct
- Check spam folder
- Ensure 2-Step Verification is enabled

### Cloudinary Upload Fails
- Verify API credentials
- Check file size limits (10MB images, 50MB videos)
- Ensure CORS is configured in Cloudinary settings

### OTP Not Working
- Check MongoDB connection
- Verify OTP collection is created
- Check server logs for errors

### Chatbot Not Responding
- Verify Gemini API key
- Check fallback responses are working
- Review server console for API errors

