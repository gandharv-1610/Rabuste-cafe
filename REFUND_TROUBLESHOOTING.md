# Refund Troubleshooting Guide

This guide covers refund troubleshooting for the Rabuste Coffee platform, specifically for pre-orders that are cancelled by the admin.

## Why Refunds Might Not Be Possible

Refunds through Razorpay may fail for several reasons:

### 1. **Payment Method Limitations**
- **UPI Payments**: Payments made through UPI apps (Google Pay, PhonePe, etc.) may not reveal the remitter's bank account details, making automatic refunds impossible
- **IMPS Payments**: Some IMPS payments from specific banks don't share the payer's account number
- **NRE Accounts**: Payments from Non-Resident External (NRE) bank accounts cannot be refunded automatically

### 2. **Payment Age**
- Payments older than **6 months** cannot be refunded automatically
- Razorpay will return a `BAD_REQUEST_ERROR` with a message indicating the payment is too old

### 3. **Missing Payment Information**
- If the order doesn't have a `razorpayPaymentId`, refunds cannot be processed
- This can happen if:
  - Payment was made via cash or other methods
  - Payment verification failed
  - Order was created before payment was completed

### 4. **Razorpay API Errors**
- Network issues
- Invalid API credentials
- Payment already refunded
- Payment in a state that doesn't allow refunds

## How the System Handles Refunds

### Automatic Refund Process
1. When an admin cancels a pre-order (via Admin Panel → Orders → Cancel Order), the system attempts to process an automatic refund
2. The refund is processed using the `razorpayPaymentId` stored in the order
3. Refund information is stored in the order:
   - `refundId`: Razorpay refund ID
   - `refundAmount`: Amount refunded
   - `refundStatus`: Status of the refund (Pending, Processed, Failed)
4. The order's `paymentStatus` is updated to `'Refunded'` upon successful refund

### Error Handling
The system provides specific error messages based on the type of failure:

- **BAD_REQUEST_ERROR**: 
  - Payment too old → Manual refund required
  - UPI/Account issues → Manual refund via Razorpay Support Portal
  - Other issues → Check error description

- **GATEWAY_ERROR**: Payment gateway issues, may retry or process manually

### Manual Refund Process
If automatic refund fails:

1. **Via Razorpay Dashboard**:
   - Log in to Razorpay Dashboard
   - Navigate to Payments → Find the payment using `razorpayPaymentId`
   - Click "Refund" and follow the process

2. **Via Razorpay Support Portal**:
   - For UPI/IMPS payments that don't support automatic refunds
   - Obtain customer bank account details
   - Raise a request on Razorpay Support Portal with:
     - Payment ID: `razorpayPaymentId`
     - Order Number: `orderNumber`
     - Customer bank details
     - Reason for refund

## Checking Refund Status

### In Admin Panel
- Orders with refund status are marked with `paymentStatus: 'Refunded'`
- Failed refunds will show `refundStatus: 'Failed'` in the order details
- Check the order's `refundId` field for the Razorpay refund ID

### In Database
```javascript
// Find orders with failed refunds
db.orders.find({ 
  refundStatus: 'Failed',
  paymentStatus: 'Paid'
})

// Find orders with successful refunds
db.orders.find({ 
  refundStatus: 'Processed',
  paymentStatus: 'Refunded'
})
```

## Best Practices

1. **Always check refund status** after cancelling a pre-order
2. **Keep payment IDs** - Ensure `razorpayPaymentId` is always saved when payment is verified
3. **Monitor failed refunds** - Set up alerts for orders with `refundStatus: 'Failed'`
4. **Document manual refunds** - When processing manual refunds, update the order with:
   - Refund ID from Razorpay
   - Refund status
   - Notes about the manual process

## Testing Refunds

### Test Mode
- Use Razorpay test mode credentials
- Test payments can be refunded immediately
- Test refunds don't actually transfer money

### Production Mode
- Refunds take 5-7 business days to process
- Refunds are credited to the original payment method
- Monitor refund status in Razorpay Dashboard

## Common Error Messages

| Error Code | Description | Solution |
|------------|-------------|----------|
| `BAD_REQUEST_ERROR` | Payment too old | Process manually via dashboard |
| `BAD_REQUEST_ERROR` | UPI/Account not supported | Use Razorpay Support Portal |
| `GATEWAY_ERROR` | Gateway issues | Retry or process manually |
| Missing `razorpayPaymentId` | No payment ID found | Check payment verification process |

## Support

If refunds consistently fail:
1. Check Razorpay API credentials in `.env`
2. Verify Razorpay account has refund permissions
3. Contact Razorpay support with:
   - Payment ID
   - Order details
   - Error messages from logs

