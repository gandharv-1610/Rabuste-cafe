# Google Gemini API Troubleshooting Guide

## ✅ What Was Fixed

1. **Updated Package Version**: Upgraded `@google/generative-ai` from 0.2.1 to 0.24.1 (latest)
2. **Primary Model**: Using `gemini-2.0-flash` (Text-out model with best performance and limits)
3. **Smart Fallback System**: Automatically tries multiple models if primary is unavailable
4. **Added Error Handling**: Better error messages to help diagnose issues
5. **Added API Key Validation**: Checks if API key is configured before making requests

## 🚀 Next Steps

1. **Restart your server** to load the updated package:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Verify your API key** is correctly set in `server/.env`:
   ```env
   GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Test the API** by:
   - Using the Coffee Discovery feature on the Coffee Menu page
   - Using the Chatbot (bottom right corner)

## 🔍 Common Issues & Solutions

### Issue 1: "API key missing" error

**Solution**: 
- Check that `server/.env` file exists
- Verify `GOOGLE_GEMINI_API_KEY` is set correctly
- Make sure there are no spaces or quotes around the API key
- Restart the server after changing `.env`

### Issue 2: "Model not available" error

**Solution**: 
- The system automatically tries multiple models in order:
  1. `gemini-2.0-flash` (primary - Text-out model)
  2. `gemini-2.0-flash-exp` (experimental)
  3. `gemini-2.5-flash` (alternative)
  4. `gemini-1.5-flash` (fallback)
  5. `gemini-1.5-pro` (fallback)
  6. `gemini-pro` (final fallback)
- If all models fail, check your API key permissions in Google Cloud Console
- Some API keys may only have access to older models like `gemini-pro`

### Issue 3: "API quota exceeded" error

**Solution**:
- Check your Google Cloud Console for API quota limits
- Ensure your API key has the necessary permissions
- Some free tiers have rate limits

### Issue 4: "Invalid API key" error

**Solution**:
- Get a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Make sure you're using the correct key format (starts with `AIza`)
- Verify the key is not expired or revoked

### Issue 5: Network/Connection errors

**Solution**:
- Check your internet connection
- Verify firewall isn't blocking the API requests
- Try testing the API key directly in Google AI Studio

## 🧪 Testing Your API Key

You can test if your API key works by running this in Node.js:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('YOUR_API_KEY_HERE');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

model.generateContent('Hello')
  .then(result => {
    console.log('API Key works!', result.response.text());
  })
  .catch(error => {
    console.error('API Key error:', error.message);
  });
```

## 📝 Model Priority Order

The system tries models in this order (automatically falls back if unavailable):

1. **`gemini-2.0-flash`** - PRIMARY: Text-out model with best performance and limits
2. **`gemini-2.0-flash-exp`** - Experimental version
3. **`gemini-2.5-flash`** - Alternative stable version
4. **`gemini-1.5-flash`** - Fast fallback
5. **`gemini-1.5-pro`** - More capable fallback
6. **`gemini-pro`** - Original model (most compatible)

## 🆘 Still Not Working?

1. Check the server console for detailed error messages
2. Verify the API key format in your `.env` file
3. The system automatically tries multiple models - check which one is being used in server logs
4. Test your API key at https://makersuite.google.com/app/apikey
5. Check your Google Cloud Console for API usage and quotas
6. Verify you have access to Gemini 2.0 models in your Google Cloud project

## 📞 Need Help?

Check the error message in the browser console (F12) or server terminal - the updated code now provides more detailed error information to help diagnose the issue.

