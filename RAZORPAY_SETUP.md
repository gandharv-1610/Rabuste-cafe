# Razorpay Payment Integration Setup Guide

## Step 1: Create Razorpay Account

1. Go to https://razorpay.com/
2. Sign up for a Razorpay account
3. Complete KYC verification (required for live payments)

## Step 2: Get API Keys

1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** (for development) or use **Live Keys** (for production)
4. Copy your **Key ID** and **Key Secret**

## Step 3: Add Environment Variables

Add these to your `.env` file in the `server` directory:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

## Step 4: Test Mode vs Live Mode

### Test Mode (Development)
- Use Test API Keys from Razorpay Dashboard
- Test cards: https://razorpay.com/docs/payments/test-cards/
- No real money is charged

### Live Mode (Production)
- Use Live API Keys
- Real payments will be processed
- Ensure KYC is completed

## Step 5: Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle payment status updates:

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`

## Step 6: Testing

1. Start your server: `npm run dev`
2. Place an order through QR code
3. Use test card: `4111 1111 1111 1111` (any future expiry, any CVV)
4. Complete payment
5. Verify order status updates to "Paid"

## Important Notes

- **Never commit API keys to version control**
- **Use test keys during development**
- **Switch to live keys only in production**
- **Keep Key Secret secure** - it should never be exposed to frontend

## Troubleshooting

### Payment not working?
- Check if API keys are correct in `.env`
- Verify Razorpay script is loaded: `https://checkout.razorpay.com/v1/checkout.js`
- Check browser console for errors
- Verify server logs for payment creation/verification errors

### Signature verification failed?
- Ensure `RAZORPAY_KEY_SECRET` matches the key used to create the order
- Check that payment details are sent correctly from frontend

## Support

For Razorpay-specific issues, refer to:
- Documentation: https://razorpay.com/docs/
- Support: support@razorpay.com

