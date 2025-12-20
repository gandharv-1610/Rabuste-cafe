# 🗺️ Google Maps Setup Instructions

## Overview
The contact section on the Home page includes a Google Maps embed. To enable the map view, you need to add a Google Maps API key.

## Getting a Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (Google provides free credits, and Embed API usage is typically free for reasonable traffic)

### Step 2: Enable Required APIs
1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Enable the following APIs:
   - **Maps Embed API** (for the map embed)
   - **Places API** (for Google Reviews slider)
3. Click on each API and press **Enable**

### Step 3: Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key
4. (Optional but recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your website domains:
     - `localhost:3000/*` (for development)
     - `yourdomain.com/*` (for production)
   - Under "API restrictions", select "Restrict key" and choose:
     - Maps Embed API
     - Places API

### Step 4: Add API Key to Environment Variables

1. **Create or update** `client/.env` file:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   REACT_APP_GOOGLE_PLACE_ID=your_place_id_here
   ```

2. **Getting Your Place ID**:
   - Go to [Google Maps](https://www.google.com/maps)
   - Search for your business: "RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007"
   - Click on your business listing
   - In the URL, you'll see something like: `.../place/Rabuste+Coffee/@.../data=...`
   - Or use the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) tool
   - Copy the Place ID (it looks like: `ChIJ...` or similar)

3. **Important**: 
   - Variables must start with `REACT_APP_` to be accessible in React
   - Never commit the `.env` file to version control (it should be in `.gitignore`)
   - Restart your development server after adding the keys

### Step 5: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
cd client
npm start
```

## Alternative: Without API Key

If you don't want to set up an API key right now, the contact section will show a fallback with a link to open Google Maps in a new tab. The map will still work, just not embedded.

## Current Address

The map shows:
**RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007**

## Google Reviews Feature

The Home page includes a Google Reviews slider that displays reviews from Google Maps. To enable this:

1. **Enable Places API** (see Step 2 above)
2. **Get your Place ID** (see Step 4 above)
3. **Add Place ID to `.env`**:
   ```env
   REACT_APP_GOOGLE_PLACE_ID=your_place_id_here
   ```

The reviews are fetched client-side using the Google Maps JavaScript API Places library. Reviews are displayed in a carousel slider with:
- Star ratings
- Review text
- Author photos and names (clickable links to Google profiles)
- "Reviews powered by Google" attribution

## Cost Information

- **Maps Embed API**: Free for unlimited use (as of current Google pricing)
- **Places API**: 
  - First $200/month free (covers most small to medium websites)
  - Place Details requests: $17 per 1,000 requests
  - Check [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/) for current details
- You need to enable billing on your Google Cloud account, but you won't be charged for reasonable usage

## Troubleshooting

### Map Not Showing
1. Check if `REACT_APP_GOOGLE_MAPS_API_KEY` is set in `client/.env`
2. Verify the API key is correct (no extra spaces)
3. Make sure Maps Embed API is enabled in Google Cloud Console
4. Check browser console for errors
5. Verify API key restrictions allow your domain

### API Key Errors
- "This API project is not authorized to use this API" → Enable Maps Embed API and Places API in Google Cloud Console
- "RefererNotAllowedMapError" → Add your domain to API key restrictions
- "ApiNotActivatedMapError" → Enable Maps Embed API and Places API in Google Cloud Console

### Reviews Not Showing
1. Verify `REACT_APP_GOOGLE_PLACE_ID` is set correctly in `client/.env`
2. Check that Places API is enabled in Google Cloud Console
3. Ensure your business has reviews on Google Maps
4. Check browser console for any error messages
5. Verify the Place ID is correct (you can test it using the [Place Details API](https://developers.google.com/maps/documentation/places/web-service/details))

## Security Best Practices

1. ✅ **Restrict API Key**: Only allow specific domains (localhost for dev, your domain for prod)
2. ✅ **Limit APIs**: Only enable Maps Embed API and Places API (the ones you need)
3. ✅ **Use Environment Variables**: Never hardcode API keys or Place IDs in source code
4. ✅ **Monitor Usage**: Set up billing alerts in Google Cloud Console
5. ✅ **Review Attribution**: The reviews component includes required Google attribution

