# Digital Ordering System - Complete Guide

## Overview

The Rabuste Coffee ordering system now supports:
- **QR Code Self-Service Ordering** (with online payment via Razorpay)
- **Counter Ordering** (salesperson-assisted, cash payment)
- **Sequential Order Numbers** (starting from 00000000001)
- **Daily Token Numbers** (resets every day, helps customers track their order)
- **Payment Status Tracking** (Paid/Pending/Failed)

## Key Features

### 1. Order Numbering System
- **Order Number**: Sequential, starts from `00000000001`, increments with each order
- **Token Number**: Daily counter that resets at midnight, helps customers identify their order easily
- Format: Order #00000000001, Token #1 (first order of the day)

### 2. Order Sources

#### QR Code Ordering (`/order`)
- Customer scans QR code to access ordering page
- No table number required
- **Payment Required**: Razorpay integration
- Order source: `QR`
- Payment status: `Pending` → `Paid` (after successful payment)

#### Counter Ordering (`/counter`)
- Salesperson places order for customer
- Accessible from Admin Panel → Counter Order tab
- **No Payment Required**: Automatically marked as paid
- Order source: `Counter`
- Payment status: `Paid` (Cash)
- Payment method: `Cash`

### 3. Payment System

#### Razorpay Integration
- **QR Orders**: Must complete Razorpay payment
- **Counter Orders**: Automatically marked as paid (cash transaction)

#### Payment Status on Receipt
- ✅ **Paid (Razorpay)**: Online payment completed
- ✅ **Paid (Cash)**: Counter order, cash payment
- ⏳ **Pending**: Payment not completed (QR orders only)

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd server
npm install razorpay
```

### Step 2: Configure Razorpay

1. Create account at https://razorpay.com/
2. Get API keys from Dashboard → Settings → API Keys
3. Add to `server/.env`:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

See `RAZORPAY_SETUP.md` for detailed setup guide.

### Step 3: Access Points

#### For Customers (QR Code)
- URL: `/order`
- QR Code should link to: `https://yourdomain.com/order`
- Payment: Required via Razorpay

#### For Salesperson (Counter)
- URL: `/counter`
- Access from: Admin Panel → Counter Order tab
- Payment: Not required (auto-marked as paid)

## Order Flow

### QR Code Order Flow
1. Customer scans QR code → Opens `/order`
2. Customer browses menu, adds items to cart
3. Customer enters name/email (optional)
4. Customer clicks "Place Order"
5. Order created with status: `Pending` payment
6. Razorpay checkout opens
7. Customer completes payment
8. Payment verified → Order status: `Paid`
9. Receipt displayed with Token Number

### Counter Order Flow
1. Salesperson opens `/counter` (from admin panel)
2. Salesperson adds items to cart
3. Salesperson enters customer name (optional)
4. Salesperson clicks "Complete Order (Cash)"
5. Order created with status: `Paid` (Cash)
6. Receipt displayed immediately with Token Number

## Receipt Information

Each receipt shows:
- **Order Number**: Sequential (00000000001, 00000000002, etc.)
- **Token Number**: Daily counter (#1, #2, etc. - resets at midnight)
- **Order Source**: QR or Counter
- **Payment Status**: Paid (Razorpay/Cash) or Pending
- **Items**: All ordered items with quantities and prices
- **Totals**: Subtotal, Tax (5%), Total
- **Estimated Ready Time**: Based on prep times

## Database Schema Updates

### Order Model
- `orderNumber`: Sequential string (00000000001)
- `tokenNumber`: Daily counter (resets at midnight)
- `tableNumber`: Optional (can be empty)
- `orderSource`: 'Counter' or 'QR'
- `paymentStatus`: 'Paid', 'Pending', 'Failed'
- `paymentMethod`: 'Cash', 'Razorpay', 'Other'
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID
- `razorpaySignature`: Payment signature for verification

## API Endpoints

### Orders
- `POST /api/orders` - Create order (public)
  - Body: `{ items, customerName, customerEmail, notes, orderSource }`
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (admin)

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment signature

## Admin Features

### Orders Management
- View all orders
- Update order status (Pending → Preparing → Ready → Completed)
- View receipts
- Filter by status, date, etc.

### Counter Order
- Access from Admin Panel → Counter Order tab
- Quick order placement for walk-in customers
- No payment integration needed

### Analytics
- Total orders
- Orders per hour
- Most ordered items
- Average prep time
- Peak ordering time
- Revenue statistics

## Testing

### Test Razorpay Payment
1. Use test API keys from Razorpay Dashboard
2. Test card: `4111 1111 1111 1111`
3. Any future expiry date
4. Any CVV
5. Complete payment flow

### Test Counter Order
1. Login to Admin Panel
2. Go to Counter Order tab
3. Click "Open Counter Order Page"
4. Add items and complete order
5. Verify receipt shows "Paid (Cash)"

## Important Notes

1. **Order Numbers**: Sequential, never resets (00000000001, 00000000002, ...)
2. **Token Numbers**: Daily counter, resets at midnight (1, 2, 3, ...)
3. **Payment**: QR orders require payment, Counter orders are auto-paid
4. **Receipt**: Always shows payment status and token number
5. **QR Code**: Should link to `/order` route
6. **Security**: Never expose Razorpay Key Secret to frontend

## Troubleshooting

### Order creation fails
- Check if menu items have prices set
- Verify database connection
- Check server logs for errors

### Payment not working
- Verify Razorpay keys in `.env`
- Check Razorpay script is loaded
- Verify payment verification endpoint

### Token number not showing
- Check OrderCounter model is working
- Verify date-based token generation

## Next Steps

1. Generate QR codes linking to `/order`
2. Place QR codes on tables
3. Train staff on counter ordering system
4. Set up Razorpay live keys for production
5. Test complete order flow end-to-end

