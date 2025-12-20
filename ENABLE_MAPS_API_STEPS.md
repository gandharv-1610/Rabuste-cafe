# ✅ Enable Maps Embed API - Direct Steps

Since you've already set up billing, you just need to enable the API:

## Step-by-Step Instructions

### Step 1: Open API Library
1. Go to: https://console.cloud.google.com/apis/library
2. Make sure you're in the **correct project** (the one where your API key was created)

### Step 2: Enable Maps Embed API
1. In the search box at the top, type: **Maps Embed API**
2. Click on the result: **"Maps Embed API"** (by Google)
3. Click the big blue **"ENABLE"** button
4. Wait 10-30 seconds for it to enable
5. You should see a success message or the page will change

### Step 3: Verify It's Enabled
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Scroll down to "Enabled APIs"
3. Look for **"Maps Embed API"** in the list
4. If you see it, you're good to go!

### Step 4: Restart Your React Server
```bash
# Stop your React server (Ctrl+C)
cd client
npm start
```

### Step 5: Test
1. Open: http://localhost:3000
2. Scroll to the bottom of the Home page
3. The map should now display!

## Still Not Working?

### Check API Key Restrictions:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Under **"API restrictions"**:
   - Choose **"Don't restrict key"** (for testing)
   - OR if you want to restrict, make sure **"Maps Embed API"** is checked
4. Click **"SAVE"** at the bottom
5. Wait 1-2 minutes for changes to propagate

### Verify Your API Key in .env:
- File location: `client/.env`
- Should have: `REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_key_here`
- No quotes, no spaces around the `=`
- Make sure it's the correct key (the one you just enabled Maps Embed API for)

### Common Mistakes:
- ❌ Using wrong project (check project dropdown at top)
- ❌ Enabling wrong API (must be "Maps Embed API", not "Maps JavaScript API")
- ❌ Not restarting React server after changes
- ❌ API key restrictions blocking it

## Quick Test URL

You can test if your API key works by opening this URL in your browser (replace YOUR_API_KEY):
```
https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=RABUSTE,+Dimpal+Row+House,+15,+Gymkhana+Rd,+Piplod,+Surat,+Gujarat+395007
```

If this shows a map, your API key works! If not, check the error message.

