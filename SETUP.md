# Quick Setup Guide

## Step-by-Step Setup

1. **Install all dependencies**
   ```bash
   npm run install-all
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
   
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

   To get Google Gemini API Key:
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key
   - Copy and paste into .env file

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000) servers.

5. **Access the application**
   - Open browser: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local)
- Check connection string in `.env` file
- Verify MongoDB Atlas network access settings

### Gemini API Errors
- Verify API key is correct
- Check API quota/limits
- Ensure internet connection

### Port Already in Use
- Change PORT in `server/.env`
- Kill process using port 3000 or 5000
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`

## First Steps After Setup

1. Visit the admin panel at http://localhost:3000/admin
2. Add some coffee items to the menu
3. Add art pieces to the gallery
4. Create a workshop
5. Explore the frontend pages

