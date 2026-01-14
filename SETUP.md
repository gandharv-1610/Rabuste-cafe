# Setup & Installation Guide

Complete guide for setting up and running the Rabuste Coffee platform.

## 📋 Prerequisites

- **Node.js** (v18 LTS recommended, v16+ supported) - [Download](https://nodejs.org/)
- **MongoDB** - Local installation or MongoDB Atlas account
- **Google Gemini API Key** - [Get from Google AI Studio](https://makersuite.google.com/app/apikey)
- **Cloudinary Account** - [Sign up](https://cloudinary.com) (free tier available)
- **Razorpay Account** - [Sign up](https://razorpay.com) (for payments)
- **Gmail Account** - For email service (requires App Password)
- **Google Cloud Account** - For Maps and Places API (optional but recommended)

## 🚀 Step 1: Install Dependencies

You can install everything with a single command (recommended), or run the individual installs.

```bash
# From the project root
npm run install-all
```

Or, run the steps manually:

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

## 🔧 Step 2: Set Up Environment Variables

### Server Environment (`server/.env`)

Create `server/.env` file with the following:

```env
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rabuste-coffee
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rabuste-coffee

# JWT Secret (Required for admin authentication)
# Use a strong random string (32+ characters)
JWT_SECRET=your_very_strong_random_secret_key_here

# Admin Seed (Optional - defaults provided)
ADMIN_SEED_EMAIL=admin@rabuste.coffee
ADMIN_SEED_PASSWORD=ChangeMeNow!123

# Google Gemini API (Required for AI features)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Configuration (Required for image/video uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional - for OTP and notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Razorpay Configuration (Required for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Client Environment (`client/.env`) - Optional

Create `client/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api

# Google Maps (Optional - for map and reviews)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_GOOGLE_PLACE_ID=your_google_place_id
```

## 🗄️ Step 3: MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
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

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get connection string and update `MONGODB_URI` in `.env`

## 🤖 Step 4: Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key" or "Get API Key"
4. Select your Google Cloud project (or create a new one)
5. Copy the API key (starts with `AIza...`)
6. Add to `server/.env` as `GOOGLE_GEMINI_API_KEY`

**Note**: AI features will have fallback responses if API key is not configured.

## ☁️ Step 5: Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret
4. Add to `server/.env`

**Note**: Required for image and video uploads in Admin Panel.

## 💳 Step 6: Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Complete KYC verification (required for live payments)
3. Go to Dashboard → Settings → API Keys
4. Generate **Test Keys** (for development) or use **Live Keys** (for production)
5. Copy **Key ID** and **Key Secret**
6. Add to `server/.env`:
   ```env
   RAZORPAY_KEY_ID=your_key_id_here
   RAZORPAY_KEY_SECRET=your_key_secret_here
   ```

**Test Cards**: Use test cards from [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)

## 📧 Step 7: Gmail App Password Setup (Optional)

Required only if you want email features (OTP, notifications):

1. Go to your Google Account settings
2. Enable 2-Step Verification (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Use this password in `EMAIL_PASS` (not your regular Gmail password)

**Note**: Email features will not work without proper Gmail App Password setup.

## 🗺️ Step 8: Google Maps & Places API Setup (Optional)

### Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable billing (Google provides $200/month free credits)
4. Go to **APIs & Services** > **Library**
5. Enable:
   - **Maps Embed API** (for map embed)
   - **Places API** (for Google Reviews)
6. Go to **APIs & Services** > **Credentials**
7. Create API Key
8. (Recommended) Restrict the API key:
   - Application restrictions: `localhost:3000/*` (dev), `yourdomain.com/*` (prod)
   - API restrictions: Only Maps Embed API and Places API

### Get Google Place ID

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your business
3. Click on your business listing
4. Use [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) to get Place ID
5. Add to `client/.env`:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
   REACT_APP_GOOGLE_PLACE_ID=your_place_id
   ```

## 👤 Step 9: Create Admin User

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

## ▶️ Step 10: Start the Application

### Option 1: Run Both Servers Concurrently (Recommended)

From root directory:
```bash
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## 🌐 Step 11: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Panel**: http://localhost:3000/admin (requires login)

## ✅ Step 12: First Login & Setup

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
   - Configure billing settings (tax rates)
   - Configure pre-order settings (if using pre-orders)

## 🧪 Testing Features

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

### 6. Ordering System
- Test QR ordering: `/order`
- Test counter ordering: Admin Panel → Counter Order tab
- Test Razorpay payment (use test cards)

### 7. Analytics Dashboard
- Go to Admin Panel → Analytics tab
- View enhanced KPIs with trends
- Check AI insights panel
- View tomorrow's forecast
- Test conversational analytics

### 8. Pre-Order System
- Test pre-order: `/pre-order`
- Select pickup time slot
- Complete payment
- Admin can cancel and process refunds
- Check pre-order settings in Admin Panel

### 9. Site Media
- Go to Admin Panel > Site Media
- Add hero background (image or video)
- Configure story section visuals
- Set active/inactive status

### 10. Billing & Pre-Order Settings
- Configure tax rates (CGST/SGST)
- Set tax calculation method
- Enable/disable pre-orders
- Configure pre-order messages

### 9. Billing Settings
- Go to Admin Panel > Settings (or Billing Settings)
- Configure CGST rate (default: 2.5%)
- Configure SGST rate (default: 2.5%)
- Choose tax calculation method:
  - `onSubtotal`: Tax calculated on subtotal before discount
  - `onDiscountedSubtotal`: Tax calculated on subtotal after discount
- Save settings

### 10. Pre-Order Settings
- Go to Admin Panel > Settings (or Pre-Order Settings)
- Enable/disable pre-orders
- Set custom message when pre-orders are disabled
- Configure customer support number
- Save settings

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Used strong `JWT_SECRET` (random string, 32+ characters)
- [ ] Set secure MongoDB credentials
- [ ] Not committing `.env` files to version control
- [ ] Using HTTPS in production
- [ ] Restricted MongoDB Atlas IP whitelist
- [ ] Restricted Google Maps API key to specific domains
- [ ] Using test Razorpay keys during development
- [ ] Environment-specific credentials for production

## 📝 Environment Variables Quick Reference

### Required (Server)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GOOGLE_GEMINI_API_KEY` - For AI features
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - For media uploads
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - For payments

### Optional (Server)
- `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` - Admin user credentials (defaults provided)
- `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` - For email features
- `PORT` - Backend port (defaults to 5000)

### Optional (Client)
- `REACT_APP_API_URL` - Backend API URL (defaults to http://localhost:5000/api)
- `REACT_APP_GOOGLE_MAPS_API_KEY` - For Google Maps
- `REACT_APP_GOOGLE_PLACE_ID` - For Google Reviews

## 🚢 Production Deployment

### Frontend (Vercel/Netlify)

1. Build: `cd client && npm run build`
2. Deploy the `build` folder
3. Set environment variables in hosting platform

### Backend (Heroku/Railway/Render)

1. Set all environment variables in hosting platform
2. Ensure MongoDB Atlas is accessible
3. Deploy the `server` folder
4. Run seed script: `npm run seed:admin`

## 💰 Cost Information

- **MongoDB Atlas**: Free tier available (512MB storage)
- **Cloudinary**: Free tier available (25GB storage, 25GB bandwidth/month)
- **Google Gemini API**: Free tier with rate limits
- **Google Maps Embed API**: Free for unlimited use
- **Google Places API**: $200/month free credits
- **Razorpay**: Transaction fees apply (check Razorpay pricing)

## 📚 Next Steps

1. Customize content in Admin Panel
2. Upload hero videos/images via Site Media
3. Configure daily offers
4. Test all features
5. Set up production environment
6. Deploy to production

For troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
