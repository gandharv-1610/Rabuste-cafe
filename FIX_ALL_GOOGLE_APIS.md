# 🔧 Fix All Google APIs - Complete Guide

## Overview

This project uses **3 Google APIs** that need to be configured:
1. **Google Gemini API** - For AI chatbot and coffee discovery (⚠️ **CURRENTLY SUSPENDED**)
2. **Google Maps Embed API** - For displaying map on Home page
3. **Google Places API** - For displaying Google Reviews on Home page

---

## 🔴 Issue 1: Google Gemini API (SUSPENDED)

### Current Status
Your Gemini API key has been **SUSPENDED** by Google and cannot be reactivated.

**Error Message:**
```
Permission denied: Consumer 'api_key:...' has been suspended.
```

### ✅ Solution: Get a New API Key

#### Step 1: Create New Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Select your Google Cloud project (or create a new one)
5. Copy the new API key (starts with `AIza...`)

#### Step 2: Update Server Environment

1. Open `server/.env` file
2. Replace the old suspended key:
   ```env
   GOOGLE_GEMINI_API_KEY=your_new_api_key_here
   ```
3. **Important**: 
   - No spaces around the `=` sign
   - No quotes around the key
   - Save the file

#### Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
cd server
npm run dev
```

#### Step 4: Test

1. Open `test-ai-api.html` in your browser
2. Click **"Test Connection"**
3. Should see: ✅ SUCCESS: Gemini API is working correctly!

---

## 🗺️ Issue 2: Google Maps Embed API

### Current Status
Your Maps API key is configured: `AIzaSyBY5SDq2JgefQvaDTpZMwjZQe93nwr5lAE`

### ✅ Verify It's Working

#### Step 1: Check if Maps Embed API is Enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with your API key)
3. Go to **APIs & Services** > **Library**
4. Search for **"Maps Embed API"**
5. If it shows **"Enable"**, click it (if already enabled, you'll see "API enabled")

#### Step 2: Verify API Key Restrictions

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key: `AIzaSyBY5SDq2JgefQvaDTpZMwjZQe93nwr5lAE`
3. Under **"API restrictions"**:
   - Should have **"Maps Embed API"** enabled
   - OR set to **"Don't restrict key"** (for testing)
4. Under **"Application restrictions"**:
   - For development: Add `localhost:3000/*`
   - OR set to **"None"** (for testing)

#### Step 3: Test the Map

1. Open: `http://localhost:3000`
2. Scroll to the Contact section at the bottom
3. You should see an embedded Google Map

#### Step 4: If Map Not Showing

**Check Browser Console (F12)** for errors:
- `"This API project is not authorized"` → Enable Maps Embed API
- `"RefererNotAllowedMapError"` → Add `localhost:3000/*` to API key restrictions
- `"ApiNotActivatedMapError"` → Enable Maps Embed API

**Test API Key Directly:**
Open this URL in your browser (replace with your key):
```
https://www.google.com/maps/embed/v1/place?key=AIzaSyBY5SDq2JgefQvaDTpZMwjZQe93nwr5lAE&q=RABUSTE,+Dimpal+Row+House,+15,+Gymkhana+Rd,+Piplod,+Surat,+Gujarat+395007
```

If the map shows, your API key works!

---

## ⭐ Issue 3: Google Places API (Reviews)

### Current Status
Your Place ID is configured: `ChIJtRkbEQBN4DsRn8cA2oTrRbo`

### ✅ Verify It's Working

#### Step 1: Enable Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Library**
4. Search for **"Places API"**
5. Click **"Enable"** if not already enabled

#### Step 2: Verify API Key Has Places API Access

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **"API restrictions"**:
   - Should have **"Places API"** enabled
   - OR set to **"Don't restrict key"** (for testing)

#### Step 3: Verify Place ID

Your Place ID: `ChIJtRkbEQBN4DsRn8cA2oTrRbo`

**Test Place ID:**
1. Go to [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Enter: "RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007"
3. Verify the Place ID matches

#### Step 4: Test Reviews

1. Open: `http://localhost:3000`
2. Scroll to the Reviews section
3. You should see Google Reviews in a slider

#### Step 5: If Reviews Not Showing

**Check Browser Console (F12)** for errors:
- `"API_KEY is missing"` → Check `client/.env` has `REACT_APP_GOOGLE_MAPS_API_KEY`
- `"PLACE_ID is missing"` → Check `client/.env` has `REACT_APP_GOOGLE_PLACE_ID`
- `"Places API error"` → Enable Places API in Google Cloud Console

**Verify Environment Variables:**
Make sure `client/.env` has:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBY5SDq2JgefQvaDTpZMwjZQe93nwr5lAE
REACT_APP_GOOGLE_PLACE_ID=ChIJtRkbEQBN4DsRn8cA2oTrRbo
```

**Restart React Server:**
```bash
# Stop server (Ctrl+C)
cd client
npm start
```

---

## 📋 Complete Checklist

### Gemini API
- [ ] Created new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Updated `server/.env` with new key: `GOOGLE_GEMINI_API_KEY=your_new_key`
- [ ] Restarted server
- [ ] Tested connection using `test-ai-api.html`

### Maps Embed API
- [ ] Enabled Maps Embed API in Google Cloud Console
- [ ] Verified API key has Maps Embed API access
- [ ] Added `localhost:3000/*` to API key restrictions (or set to None)
- [ ] Verified map shows on Home page
- [ ] Tested API key directly in browser

### Places API
- [ ] Enabled Places API in Google Cloud Console
- [ ] Verified API key has Places API access
- [ ] Verified Place ID is correct: `ChIJtRkbEQBN4DsRn8cA2oTrRbo`
- [ ] Verified `client/.env` has both `REACT_APP_GOOGLE_MAPS_API_KEY` and `REACT_APP_GOOGLE_PLACE_ID`
- [ ] Restarted React server after .env changes
- [ ] Verified reviews show on Home page

---

## 🔒 Security Best Practices

### API Key Restrictions

**For Development:**
- Application restrictions: `localhost:3000/*`
- API restrictions: Only Maps Embed API and Places API

**For Production:**
- Application restrictions: `yourdomain.com/*`
- API restrictions: Only the APIs you need

### Environment Variables

✅ **DO:**
- Keep `.env` files in `.gitignore`
- Never commit API keys to Git
- Use different keys for development and production

❌ **DON'T:**
- Share API keys publicly
- Use unrestricted keys in production
- Hardcode keys in source code

---

## 💰 Cost Information

### Gemini API
- Free tier available with rate limits
- Check [Google AI Studio Pricing](https://ai.google.dev/pricing)

### Maps Embed API
- **FREE** for unlimited use

### Places API
- **$200/month free credits**
- Place Details: $17 per 1,000 requests after free tier
- Reviews fetched once per page load (very low cost)

**Note:** Google requires billing to be enabled, but you won't be charged for reasonable usage within free tiers.

---

## 🆘 Troubleshooting

### All APIs Failing

1. **Check Billing:**
   - Go to Google Cloud Console > Billing
   - Ensure billing account is linked (required even for free tier)

2. **Check Project:**
   - Make sure you're using the correct Google Cloud project
   - All APIs should be enabled in the same project

3. **Check API Key:**
   - Verify the key is correct (no typos)
   - Check if key is restricted too much
   - Try creating a new key if issues persist

### Specific Error Messages

**"API key suspended"** → Create a new API key (old one cannot be reactivated)

**"This API project is not authorized"** → Enable the specific API in Google Cloud Console

**"RefererNotAllowedMapError"** → Add your domain to API key restrictions

**"Quota exceeded"** → Check your usage in Google Cloud Console

---

## 📞 Quick Links

- [Google AI Studio (Gemini API)](https://makersuite.google.com/app/apikey)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps Embed API Documentation](https://developers.google.com/maps/documentation/embed)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)

---

## ✅ After Fixing

Once all APIs are working:

1. **Test Gemini API:**
   - Open `test-ai-api.html`
   - Click "Test Connection" → Should show ✅ SUCCESS

2. **Test Maps:**
   - Go to `http://localhost:3000`
   - Scroll to Contact section → Should see embedded map

3. **Test Reviews:**
   - Go to `http://localhost:3000`
   - Scroll to Reviews section → Should see Google reviews slider

All Google APIs should now be working! 🎉

