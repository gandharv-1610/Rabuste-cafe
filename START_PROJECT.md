# 🚀 How to Start the Project

## ✅ Database Connection Fixed!

I've fixed the MongoDB connection string - it now includes the database name: `rabuste-coffee`

## 📋 Step-by-Step Instructions

### 1. Start the Backend Server

**Option A: Using PowerShell (Recommended)**
1. Open a new PowerShell window
2. Navigate to the server directory:
   ```powershell
   cd "C:\Users\Shubh Srivastava\Desktop\Rabuste Coffee\Rabuste-Coffee-Codexa\server"
   ```
3. Start the server:
   ```powershell
   npm run dev
   ```

**Option B: Using Node directly**
```powershell
cd "C:\Users\Shubh Srivastava\Desktop\Rabuste Coffee\Rabuste-Coffee-Codexa\server"
node index.js
```

**What to look for:**
- ✅ `🔄 Connecting to MongoDB...`
- ✅ `✅ MongoDB Connected`
- ✅ `Database: rabuste-coffee`
- ✅ `✅ Server running on port 5000`

**If you see errors:**
- ❌ MongoDB Connection Error → Check your `.env` file
- ❌ Port already in use → Kill the process: `netstat -ano | findstr ":5000"` then `taskkill /PID <PID> /F`
- ❌ Module not found → Run `npm install` in the server directory

### 2. Start the Frontend (in a NEW terminal window)

1. Open another PowerShell window
2. Navigate to the project root:
   ```powershell
   cd "C:\Users\Shubh Srivastava\Desktop\Rabuste Coffee\Rabuste-Coffee-Codexa"
   ```
3. Start the frontend:
   ```powershell
   npm run client
   ```
   OR
   ```powershell
   cd client
   npm start
   ```

**What to look for:**
- ✅ `Compiled successfully!`
- ✅ Browser should open automatically to `http://localhost:3000`

### 3. Verify Everything is Working

1. **Backend Health Check:**
   - Open browser: http://localhost:5000/api/health
   - Should see: `{"status":"OK","message":"Rabuste Coffee API is running","database":"Connected"}`

2. **Frontend:**
   - Open browser: http://localhost:3000
   - Website should load completely now!

### 4. Quick Start (Both Servers at Once)

From the project root:
```powershell
cd "C:\Users\Shubh Srivastava\Desktop\Rabuste Coffee\Rabuste-Coffee-Codexa"
npm run dev
```

This starts both frontend and backend together.

## 🔧 Troubleshooting

### Server Won't Start
1. Check if port 5000 is already in use:
   ```powershell
   netstat -ano | findstr ":5000"
   ```
2. Kill the process if needed:
   ```powershell
   taskkill /PID <PID> /F
   ```
3. Make sure MongoDB connection string is correct in `server/.env`

### Database Connection Issues
- ✅ Connection string is fixed: `mongodb+srv://...@rabusto-coffee.vhcl13v.mongodb.net/rabuste-coffee?appName=Rabusto-Coffee`
- ✅ Tested and working
- If still having issues, check MongoDB Atlas:
  - Network Access: Your IP should be whitelisted
  - Database User: Credentials should match `.env` file

### Frontend Can't Connect to Backend
- Make sure backend is running on port 5000
- Check browser console (F12) for CORS errors
- Verify `REACT_APP_API_URL` in `client/.env` (if exists) or it defaults to `http://localhost:5000/api`

## ✅ What Was Fixed

1. ✅ **MongoDB Connection String** - Added database name `rabuste-coffee`
2. ✅ **JWT_SECRET** - Added to `.env` file
3. ✅ **Better Error Logging** - Server now shows detailed connection info
4. ✅ **Improved Error Handling** - Better error messages for debugging

## 🎯 Next Steps

Once both servers are running:
1. Visit http://localhost:3000
2. The website should load completely
3. Test the admin panel: http://localhost:3000/admin/login
4. Default admin credentials (if seeded):
   - Email: `admin@rabuste.coffee`
   - Password: `ChangeMeNow!123`

