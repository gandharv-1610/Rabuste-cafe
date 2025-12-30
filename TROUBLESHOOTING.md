# Troubleshooting Guide

Common issues and solutions for the Rabuste Coffee platform.

## 🔴 MongoDB Connection Issues

### Problem: "MongoDB Connection Error"

**Solutions:**
1. **Local MongoDB:**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `server/.env`
   - Verify MongoDB service is started

2. **MongoDB Atlas:**
   - Verify connection string format: `mongodb+srv://username:password@cluster.mongodb.net/database`
   - Check network access settings in MongoDB Atlas
   - Verify IP whitelist includes your IP (or `0.0.0.0/0` for development)
   - Ensure database user has correct permissions
   - Check if cluster is paused (free tier clusters pause after inactivity)

### Problem: "Database name not specified"

**Solution:**
- Include database name in connection string: `mongodb://localhost:27017/rabuste-coffee`

## 🔐 Admin Authentication Issues

### Problem: Cannot log in to admin panel

**Solutions:**
1. Verify admin user exists:
   ```bash
   cd server
   npm run seed:admin
   ```

2. Check `JWT_SECRET` is set in `server/.env`

3. Ensure MongoDB connection is working

4. Check server console for errors

5. Verify password is correct (default: `ChangeMeNow!123`)

### Problem: "Token expired" or "Invalid token"

**Solutions:**
- Log out and log in again
- Clear browser localStorage
- Check if `JWT_SECRET` changed (requires new login)

## 🤖 Google Gemini API Issues

### Problem: "API key missing" or "API key suspended"

**Solutions:**
1. **Get New API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Update `server/.env`: `GOOGLE_GEMINI_API_KEY=your_new_key`
   - Restart server

2. **Verify API Key:**
   - Check no spaces or quotes around the key
   - Ensure key starts with `AIza`
   - Verify key is not expired or revoked

3. **Check API Quota:**
   - Go to Google Cloud Console
   - Check API usage and quotas
   - Some free tiers have rate limits

### Problem: "Model not available"

**Solutions:**
- The system automatically tries multiple models (gemini-2.0-flash, gemini-1.5-flash, etc.)
- Check server logs to see which model is being used
- Verify your API key has access to Gemini models
- Some API keys may only have access to older models

### Problem: Chatbot/Coffee Discovery not working

**Solutions:**
- Check if API key is configured
- Verify API key is correct
- Check server console for detailed errors
- System has fallback responses when API unavailable

## 🗺️ Google Maps & Places API Issues

### Problem: Map not showing

**Solutions:**
1. **Enable Maps Embed API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services > Library
   - Search for "Maps Embed API"
   - Click "Enable"

2. **Check API Key:**
   - Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set in `client/.env`
   - No spaces or quotes around the key
   - Restart React server after adding key

3. **Check API Key Restrictions:**
   - Go to APIs & Services > Credentials
   - Click on your API key
   - Under "Application restrictions": Add `localhost:3000/*` (dev) or `yourdomain.com/*` (prod)
   - Under "API restrictions": Ensure "Maps Embed API" is enabled

4. **Test API Key:**
   - Open this URL (replace YOUR_KEY):
   ```
   https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q=RABUSTE,+Dimpal+Row+House,+15,+Gymkhana+Rd,+Piplod,+Surat,+Gujarat+395007
   ```
   - If map shows, API key works

### Problem: Google Reviews not showing

**Solutions:**
1. **Enable Places API:**
   - Go to Google Cloud Console
   - APIs & Services > Library
   - Search for "Places API"
   - Click "Enable"

2. **Check Place ID:**
   - Verify `REACT_APP_GOOGLE_PLACE_ID` is set in `client/.env`
   - Use [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) to verify
   - Ensure your business has reviews on Google Maps

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for error messages
   - Common errors:
     - `"API_KEY is missing"` → Add to `.env`
     - `"PLACE_ID is missing"` → Add to `.env`
     - `"Places API error"` → Enable Places API

## ☁️ Cloudinary Upload Issues

### Problem: Image/Video upload fails

**Solutions:**
1. **Verify Credentials:**
   - Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `server/.env`
   - Ensure no typos or extra spaces

2. **Check File Size:**
   - Images: Max 10MB
   - Videos: Max 50MB
   - Compress files if too large

3. **Check CORS:**
   - Ensure CORS is configured in Cloudinary settings
   - Check server console for detailed errors

4. **Verify Account:**
   - Ensure Cloudinary account is active
   - Check if free tier limits are exceeded

## 📧 Email Service Issues

### Problem: Email not sending

**Solutions:**
1. **Verify Gmail App Password:**
   - Must use App Password (not regular Gmail password)
   - Enable 2-Step Verification first
   - Generate at [App Passwords](https://myaccount.google.com/apppasswords)

2. **Check Environment Variables:**
   - `EMAIL_SERVICE=gmail`
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASS=your_app_password` (16 characters, no spaces)

3. **Check Spam Folder:**
   - Emails might go to spam
   - Check spam/junk folder

4. **Check Server Logs:**
   - Look for SMTP errors in server console
   - Common errors:
     - "Invalid login" → Wrong app password
     - "Connection timeout" → Check internet/firewall

### Problem: OTP not working

**Solutions:**
- Check MongoDB connection
- Verify OTP collection is created
- Check server logs for errors
- Ensure email service is configured
- Verify OTP expiration time (default: 10 minutes)

## 💳 Razorpay Payment Issues

### Problem: Payment not working

**Solutions:**
1. **Verify API Keys:**
   - Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env`
   - Use test keys during development
   - Switch to live keys in production

2. **Check Razorpay Script:**
   - Verify script is loaded: `https://checkout.razorpay.com/v1/checkout.js`
   - Check browser console for errors

3. **Test Payment:**
   - Use test card: `4111 1111 1111 1111`
   - Any future expiry date
   - Any CVV

4. **Check Server Logs:**
   - Look for payment creation/verification errors
   - Verify payment verification endpoint is working

### Problem: Signature verification failed

**Solutions:**
- Ensure `RAZORPAY_KEY_SECRET` matches the key used to create the order
- Check that payment details are sent correctly from frontend
- Verify payment verification logic in backend

## 📊 Analytics Dashboard Issues

### Problem: Analytics not loading

**Solutions:**
1. **Check Date Range:**
   - Ensure orders exist in the selected date range
   - Try different date ranges

2. **Check MongoDB:**
   - Verify orders are saved in database
   - Check if orders have `paymentStatus: 'Paid'` (only paid orders in analytics)

3. **Check Server Logs:**
   - Look for aggregation errors
   - Verify MongoDB aggregation pipelines are working

### Problem: AI Insights not generating

**Solutions:**
- Check if Gemini API key is configured
- System falls back to rule-based insights if AI unavailable
- Check server logs for API errors
- Verify sufficient data exists for insights

## 🖼️ Image/Content Update Issues

### Problem: Images/content not updating on frontend

**Solutions:**
1. **Hard Refresh:**
   - Windows: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

2. **Clear Browser Cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Edge: Settings → Privacy → Clear browsing data

3. **Check Network Tab:**
   - Open DevTools (F12) → Network tab
   - Check "Disable cache" checkbox
   - Refresh page
   - Verify API calls are being made

4. **Verify Database:**
   - Check if data was saved correctly in MongoDB
   - Verify image URLs are correct
   - Check Cloudinary URLs are accessible

## 🚀 Server Startup Issues

### Problem: Port already in use

**Solutions:**
1. **Windows:**
   ```powershell
   netstat -ano | findstr ":5000"
   # Note the PID, then:
   taskkill /PID <PID> /F
   ```

2. **Mac/Linux:**
   ```bash
   lsof -ti:5000 | xargs kill
   ```

3. **Change Port:**
   - Update `PORT` in `server/.env`
   - Update `REACT_APP_API_URL` in `client/.env`

### Problem: Module not found

**Solutions:**
- Install dependencies:
  ```bash
  npm install
  cd server && npm install
  cd ../client && npm install
  ```
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

### Problem: Server won't start

**Solutions:**
1. Check Node.js version: `node --version` (should be v14+)
2. Check MongoDB connection
3. Verify all required environment variables are set
4. Check server console for specific error messages
5. Ensure no syntax errors in code

## 🌐 Frontend Issues

### Problem: Frontend can't connect to backend

**Solutions:**
1. **Verify Backend is Running:**
   - Check http://localhost:5000/api/health
   - Should return: `{"status":"OK",...}`

2. **Check CORS:**
   - Backend should allow `localhost:3000`
   - Check server console for CORS errors

3. **Check API URL:**
   - Verify `REACT_APP_API_URL` in `client/.env`
   - Default: `http://localhost:5000/api`

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for network errors
   - Check if API calls are being made

### Problem: Page not loading

**Solutions:**
1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
   - Clear cache completely

3. **Check React Server:**
   - Verify React server is running
   - Check for compilation errors
   - Restart React server

## 📦 Order System Issues

### Problem: Order creation fails

**Solutions:**
1. **Check Menu Items:**
   - Ensure menu items have prices set
   - Verify items exist in database

2. **Check Database:**
   - Verify MongoDB connection
   - Check OrderCounter model is working

3. **Check Server Logs:**
   - Look for specific error messages
   - Verify order validation

4. **Check Billing Settings:**
   - Verify billing settings exist in database
   - Check tax rates are configured correctly
   - Ensure tax calculation method is set

### Problem: Token number not showing

**Solutions:**
- Check OrderCounter model is working
- Verify date-based token generation
- Check server logs for errors

### Problem: Pre-order not working

**Solutions:**
1. **Check Pre-Order Settings:**
   - Go to Admin Panel > Settings
   - Verify pre-orders are enabled (`isEnabled: true`)
   - Check if custom message is blocking orders

2. **Check Pickup Time Slots:**
   - Verify time slots are configured correctly
   - Check server logs for time slot generation errors

3. **Check Payment:**
   - Ensure Razorpay is configured
   - Verify payment is completed before order creation

### Problem: Tax calculation incorrect

**Solutions:**
1. **Check Billing Settings:**
   - Verify CGST and SGST rates are set correctly
   - Check tax calculation method (`onSubtotal` vs `onDiscountedSubtotal`)
   - Ensure billing settings exist in database

2. **Check Order Data:**
   - Verify subtotal is calculated correctly
   - Check if discounts are applied before or after tax
   - Review order items and prices

3. **Recalculate:**
   - Update billing settings in Admin Panel
   - Test with a new order

## 💰 Refund Issues

### Problem: Refund not processing

**Solutions:**
1. **Check Payment ID:**
   - Verify order has `razorpayPaymentId`
   - Check if payment was completed successfully

2. **Check Payment Age:**
   - Payments older than 6 months cannot be refunded automatically
   - Process manually via Razorpay Dashboard

3. **Check Payment Method:**
   - UPI payments may require manual refund
   - Some IMPS payments don't support automatic refunds
   - Use Razorpay Support Portal for manual processing

4. **Check Razorpay Credentials:**
   - Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
   - Ensure using correct keys (test vs live)

5. **Check Server Logs:**
   - Look for specific Razorpay API errors
   - Check refund status in order document

For detailed refund troubleshooting, see [REFUND_TROUBLESHOOTING.md](./REFUND_TROUBLESHOOTING.md)

## 🔍 General Debugging Tips

1. **Check Server Console:**
   - Look for error messages
   - Check MongoDB connection status
   - Verify API calls are being made

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   - Ensure all required variables are set
   - No typos or extra spaces
   - Restart server after changes

4. **Check Database:**
   - Verify data is saved correctly
   - Check MongoDB connection
   - Verify collections exist

5. **Test API Directly:**
   - Use Postman or curl
   - Test endpoints directly
   - Check response data

## 🆘 Still Having Issues?

1. **Check Documentation:**
   - Review [README.md](./README.md) for feature details
   - Review [SETUP.md](./SETUP.md) for setup instructions

2. **Check Logs:**
   - Server console logs
   - Browser console logs
   - MongoDB logs (if using Atlas)

3. **Verify Configuration:**
   - All environment variables set correctly
   - All services (MongoDB, Cloudinary, etc.) are accessible
   - API keys are valid and not expired

4. **Common Mistakes:**
   - Forgetting to restart server after `.env` changes
   - Using wrong API keys (test vs live)
   - Not clearing browser cache
   - Typos in environment variable names
   - Missing database name in MongoDB URI
   - Not configuring billing settings (tax calculation fails)
   - Pre-orders disabled but trying to use pre-order page
   - Using expired payment IDs for refunds

---

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For project overview, see [README.md](./README.md)

