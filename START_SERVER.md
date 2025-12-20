# How to Start the Server and Fix Loading Issues

## The Problem
Your website isn't loading completely because the **backend server (port 5000) is not running**. The frontend (port 3000) is running, but it can't fetch data from the API.

## Quick Fix Steps

### 1. Start the Backend Server

Open a **new terminal window** and run:

```powershell
cd "C:\Users\Shubh Srivastava\Desktop\Rabuste Coffee\Rabuste-Coffee-Codexa\server"
npm run dev
```

**OR** from the root directory:

```powershell
cd "C:\Users\Shubh Srivastava\Desktop\Rabuste Coffee\Rabuste-Coffee-Codexa"
npm run server
```

### 2. Check for Errors

Look for these common errors in the terminal:

#### MongoDB Connection Error
If you see: `MongoDB Connection Error: ...`
- **Solution**: Check your MongoDB Atlas connection string in `server/.env`
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify the database user credentials are correct

#### Port Already in Use
If you see: `Error: listen EADDRINUSE: address already in use :::5000`
- **Solution**: Kill the process using port 5000:
  ```powershell
  netstat -ano | findstr ":5000"
  # Note the PID, then:
  taskkill /PID <PID> /F
  ```

#### Missing Dependencies
If you see module not found errors:
- **Solution**: Install dependencies:
  ```powershell
  cd server
  npm install
  ```

### 3. Verify Server is Running

You should see:
```
MongoDB Connected
Server running on port 5000
```

### 4. Test the API

Open your browser and go to:
- http://localhost:5000/api/health

You should see: `{"status":"OK","message":"Rabuste Coffee API is running"}`

### 5. Refresh Your Website

Once the server is running, refresh your website at:
- http://localhost:3000

The website should now load completely!

## Running Both Servers Together

To run both frontend and backend at once, use:

```powershell
cd "C:\Users\Shubh Srivastava\Desktop\Rabuste Coffee\Rabuste-Coffee-Codexa"
npm run dev
```

This starts both servers concurrently.

## Common Issues Fixed

✅ **JWT_SECRET added** - I've added the missing JWT_SECRET to your `.env` file
✅ **Environment variables** - Your `.env` file is configured

## Still Having Issues?

1. **Check MongoDB Connection**:
   - Verify MongoDB Atlas cluster is running
   - Check network access settings in MongoDB Atlas
   - Test connection string

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for red error messages
   - Check Network tab for failed API calls

3. **Check Server Logs**:
   - Look at the terminal where you started the server
   - Copy any error messages you see

