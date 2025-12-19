# Installation & Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email service - optional)
- Cloudinary account (for media storage - required for uploads)
- Google Gemini API key (for AI features - optional but recommended)

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

# Google Gemini API (Required for AI features)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (Required for admin authentication)
JWT_SECRET=your_very_strong_random_secret_key_here

# Admin Seed (Optional - defaults provided)
ADMIN_SEED_EMAIL=admin@rabuste.coffee
ADMIN_SEED_PASSWORD=ChangeMeNow!123

# Email Configuration (Optional - for OTP and notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Configuration (Required for image/video uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client Environment (`client/.env`) - Optional

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 3: MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   mongod
   
   # Mac/Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```
3. Use connection string: `mongodb://localhost:27017/rabuste-coffee`

### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/rabuste-coffee
   ```
6. Replace `username`, `password`, and `cluster` with your values

## Step 4: Google Gemini API Setup

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste into `server/.env` as `GOOGLE_GEMINI_API_KEY`

**Note**: AI features will have fallback responses if API key is not configured.

## Step 5: Cloudinary Setup

1. Sign up at https://cloudinary.com (free tier available)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret
4. Paste into `server/.env`

**Note**: Required for image and video uploads in Admin Panel.

## Step 6: Gmail App Password Setup (Optional)

Required only if you want email features (OTP, notifications):

1. Go to your Google Account settings
2. Enable 2-Step Verification (if not already enabled)
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Use this password in `EMAIL_PASS` (not your regular Gmail password)

**Note**: Email features will not work without proper Gmail App Password setup.

## Step 7: Create Admin User

Run the seed script to create initial admin user:

```bash
cd server
npm run seed:admin
```

This will:
- Create an admin user if none exists
- Use email/password from `.env` or defaults
- Hash the password automatically

Default credentials (if not set in `.env`):
- Email: `admin@rabuste.coffee`
- Password: `ChangeMeNow!123`

**Important**: Change password immediately after first login!

## Step 8: Start the Application

### Option 1: Run Both Servers Concurrently

From root directory:
```bash
npm run dev
```

### Option 2: Run Separately

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

## Step 9: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Panel**: http://localhost:3000/admin (requires login)

## Step 10: First Login & Setup

1. Visit http://localhost:3000/admin/login
2. Log in with seeded admin credentials
3. Go to Settings tab
4. **Change your password** immediately
5. Start adding content:
   - Coffee menu items
   - Art pieces
   - Workshops
   - Daily offers
   - Site media (hero backgrounds, etc.)

## Testing Features

### 1. Admin Authentication
- Log in at `/admin/login`
- Access protected admin routes
- Change password in Settings

### 2. AI Coffee Discovery
- Go to Coffee Menu page
- Use AI Coffee Discovery feature
- Test with different moods/times/energy levels

### 3. Chatbot
- Click chatbot icon (bottom right)
- Ask café-related questions
- Test fallback when API unavailable

### 4. Image/Video Upload
- Go to Admin Panel
- Add coffee item with image
- Add workshop with cover image
- Upload video for hero background

### 5. Email OTP
- Register for a workshop
- Enter email
- Check email for OTP code
- Verify OTP

### 6. Site Media
- Go to Admin Panel > Site Media
- Add hero background (image or video)
- Configure story section visuals
- Set active/inactive status

## Troubleshooting

### Email Not Sending
- Verify Gmail App Password is correct (not regular password)
- Check spam folder
- Ensure 2-Step Verification is enabled
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Check server console for SMTP errors

### Cloudinary Upload Fails
- Verify API credentials in `.env`
- Check file size limits (10MB images, 50MB videos)
- Ensure CORS is configured in Cloudinary settings
- Check server console for detailed errors
- Verify Cloudinary account is active

### OTP Not Working
- Check MongoDB connection
- Verify OTP collection is created
- Check server logs for errors
- Ensure email service is configured
- Verify OTP expiration time

### Chatbot Not Responding
- Verify Gemini API key in `.env`
- Check fallback responses are working
- Review server console for API errors
- See `GEMINI_TROUBLESHOOTING.md` for detailed help
- Test API key at https://makersuite.google.com/app/apikey

### Admin Login Fails
- Verify admin user exists: `npm run seed:admin`
- Check `JWT_SECRET` is set in `.env`
- Ensure MongoDB connection is working
- Check server console for errors
- Verify password is correct

### MongoDB Connection Issues
- Verify MongoDB is running (if local)
- Check connection string format
- Verify MongoDB Atlas network access
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

## Production Deployment

See `README.md` Deployment section for production setup instructions.

## Security Notes

- Never commit `.env` files to version control
- Use strong, random `JWT_SECRET` (32+ characters)
- Change default admin password immediately
- Use HTTPS in production
- Restrict MongoDB Atlas IP whitelist
- Use environment-specific credentials

## Need Help?

- Check `README.md` for comprehensive documentation
- See `GEMINI_TROUBLESHOOTING.md` for AI-specific issues
- Review server console logs for detailed errors
- Check browser console (F12) for frontend errors
