# Quick Setup Guide

## Step-by-Step Setup

1. **Install all dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Set up MongoDB**
   - Option A: Local MongoDB
     - Install MongoDB locally
     - Start MongoDB service: `mongod`
   - Option B: MongoDB Atlas (Cloud)
     - Create account at mongodb.com/cloud/atlas
     - Create a cluster
     - Get connection string

3. **Configure Environment Variables**

   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rabuste-coffee
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rabuste-coffee
   
   # Google Gemini API (Required for AI features)
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   
   # JWT Secret (Required for admin authentication)
   JWT_SECRET=your_very_strong_random_secret_key_here
   
   # Admin Seed (Optional - defaults provided)
   ADMIN_SEED_EMAIL=admin@rabuste.coffee
   ADMIN_SEED_PASSWORD=ChangeMeNow!123
   
   # Cloudinary (Required for image/video uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Service (Optional - for OTP and notifications)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

   To get Google Gemini API Key:
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key
   - Copy and paste into .env file

   To get Cloudinary credentials:
   - Sign up at https://cloudinary.com
   - Get credentials from Dashboard

   To get Gmail App Password:
   - Enable 2-Step Verification in Google Account
   - Go to https://myaccount.google.com/apppasswords
   - Generate app password for "Mail"
   - Use this password (not your regular Gmail password)

4. **Create initial admin user**
   ```bash
   cd server
   npm run seed:admin
   ```
   This creates an admin user if none exists. Default credentials:
   - Email: `admin@rabuste.coffee` (or from `ADMIN_SEED_EMAIL`)
   - Password: `ChangeMeNow!123` (or from `ADMIN_SEED_PASSWORD`)

5. **Start the application**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000) servers.

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Login: http://localhost:3000/admin/login
   - Admin Panel: http://localhost:3000/admin (requires login)

## First Steps After Setup

1. **Log in to Admin Panel**
   - Visit http://localhost:3000/admin/login
   - Use seeded admin credentials
   - **Change your password immediately** in Settings tab

2. **Add Content**
   - Add coffee items to the menu
   - Add art pieces to the gallery
   - Create a workshop
   - Add daily offers
   - Configure site media (hero backgrounds, story visuals)

3. **Explore Features**
   - Test AI Coffee Discovery on Coffee Menu page
   - Try the Chatbot (bottom right corner)
   - Register for a workshop to test OTP system
   - Submit a franchise enquiry

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local)
- Check connection string in `.env` file
- Verify MongoDB Atlas network access settings
- Check MongoDB Atlas IP whitelist

### Admin Login Issues
- Verify admin user was created: `npm run seed:admin`
- Check `JWT_SECRET` is set in `.env`
- Ensure MongoDB connection is working
- Check server console for errors

### Gemini API Errors
- Verify API key is correct
- Check API quota/limits
- Ensure internet connection
- See `GEMINI_TROUBLESHOOTING.md` for detailed help

### Cloudinary Upload Fails
- Verify Cloudinary credentials in `.env`
- Check file size limits (10MB images, 50MB videos)
- Ensure CORS is configured in Cloudinary settings
- Check server console for detailed errors

### Port Already in Use
- Change PORT in `server/.env`
- Kill process using port 3000 or 5000
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
- On Mac/Linux: `lsof -ti:5000 | xargs kill`

### Email Not Sending
- Verify Gmail App Password is correct (not regular password)
- Check spam folder
- Ensure 2-Step Verification is enabled
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`

## Environment Variables Quick Reference

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (use strong random string)
- `GOOGLE_GEMINI_API_KEY` - For AI features
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - For media uploads

### Optional
- `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` - Admin user credentials (defaults provided)
- `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` - For email features
- `PORT` - Backend port (defaults to 5000)

## Security Checklist

- [ ] Changed default admin password
- [ ] Used strong `JWT_SECRET` (random string, 32+ characters)
- [ ] Set secure MongoDB credentials
- [ ] Not committing `.env` files to version control
- [ ] Using HTTPS in production
- [ ] Restricted MongoDB Atlas IP whitelist

## Next Steps

1. Customize content in Admin Panel
2. Upload hero videos/images via Site Media
3. Configure daily offers
4. Test all features
5. Deploy to production (see README.md Deployment section)
