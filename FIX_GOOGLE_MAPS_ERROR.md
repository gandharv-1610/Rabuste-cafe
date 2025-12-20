# 🔧 Fix: Google Maps API Not Authorized Error

## Error Message
"Google Maps Platform rejected your request. This API project is not authorized to use this API."

## Solution: Enable Maps Embed API

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Make sure you're in the correct project (the one where you created the API key)

### Step 2: Enable Maps Embed API
1. In the left sidebar, click **APIs & Services** > **Library**
2. In the search bar, type: **"Maps Embed API"**
3. Click on **"Maps Embed API"** from the results
4. Click the **"Enable"** button
5. Wait for it to enable (usually takes a few seconds)

### Step 3: Verify API is Enabled
1. Go to **APIs & Services** > **Enabled APIs**
2. You should see **"Maps Embed API"** in the list
3. If it's not there, repeat Step 2

### Step 4: Restart Your Server
After enabling the API:
```bash
# Stop your React server (Ctrl+C)
# Then restart
cd client
npm start
```

### Step 5: Test
1. Go to your Home page
2. Scroll to the bottom
3. The map should now display correctly!

## Alternative: Check API Key Restrictions

If you still get errors after enabling the API:

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **"API restrictions"**:
   - Make sure **"Don't restrict key"** is selected, OR
   - If restricted, ensure **"Maps Embed API"** is in the allowed list
4. Under **"Application restrictions"**:
   - For development: Set to **"None"** or add `localhost:3000/*`
   - For production: Add your domain

## Quick Checklist

- ✅ Maps Embed API is enabled
- ✅ API key is created
- ✅ API key has Maps Embed API in restrictions (or no restrictions)
- ✅ API key is in `client/.env` as `REACT_APP_GOOGLE_MAPS_API_KEY`
- ✅ React server restarted after adding API key

## Still Not Working?

1. **Check Browser Console** (F12):
   - Look for specific error messages
   - Check Network tab for failed requests

2. **Verify API Key**:
   - Make sure there are no extra spaces in `.env` file
   - Format: `REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here` (no quotes)

3. **Check Billing**:
   - Google Cloud requires billing to be enabled (but Maps Embed API is free)
   - Go to **Billing** in Google Cloud Console
   - Make sure a billing account is linked

4. **Wait a Few Minutes**:
   - Sometimes API enablement takes a few minutes to propagate
   - Try again after 2-3 minutes

## Cost Information

- **Maps Embed API**: Free for unlimited use
- You need billing enabled, but won't be charged for reasonable usage
- Check current pricing: https://mapsplatform.google.com/pricing/

