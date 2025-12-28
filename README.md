# Rabuste Coffee - Specialty Coffee Café Platform

A complete MERN stack web application for **Rabuste Coffee**, a specialty café that celebrates bold Robusta coffee, fine art, community workshops, and innovative technology. Built for Google Winter of Code (GWOC) Track 4.

![Rabuste Coffee](https://img.shields.io/badge/Rabuste-Coffee-amber?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge)

## 🌟 Features

### Customer-Facing Features

- **🏠 Home Page**: Hero section with configurable video/image backgrounds, scroll-based storytelling, daily offers showcase, Google Maps integration, and Google Reviews slider
- **📖 About the Café**: Story behind choosing Robusta coffee, café philosophy, and cultural inspiration
- **☕ Why Robusta?**: Educational content explaining Robusta coffee, flavor profiles, and comparisons
- **☕ Coffee Menu**: Curated Robusta-only menu with descriptions, strength levels, flavor notes, and AI-powered coffee discovery
- **🎨 Art Gallery**: Micro art gallery showcasing fine art pieces with artist stories, pricing, and availability status
- **🎓 Workshops & Experiences**: Coffee workshops, art sessions, and community events with registration system and Google Calendar integration
- **🚀 Franchise Opportunity**: Franchise information and enquiry form for potential partners with status tracking
- **🎁 Daily Offers**: Dynamic offers and specials displayed on the home page with date-based filtering
- **📱 Digital Ordering System**: QR code self-service ordering with Razorpay payment integration and counter ordering for walk-in customers

### AI-Powered Features (Google Gemini)

1. **🤖 AI Coffee Discovery**
   - Recommends perfect Robusta brew based on mood, time of day, and energy level
   - Provides personalized coffee suggestions with explanations
   - Powered by Google Gemini API with smart fallback

2. **💬 Smart Café Chatbot**
   - Domain-restricted chatbot answering only café-related questions
   - Helps users learn about coffee, art, workshops, and franchise
   - Redirects users to relevant pages
   - Graceful fallback when API is unavailable

### Admin Panel (JWT-Protected)

- **🔐 Secure Authentication**: JWT-based login system with password hashing (bcrypt)
- **📊 Dashboard**: Overview statistics and analytics for all content
- **📈 AI-Powered Analytics Dashboard**: Next-level analytics with:
  - Enhanced KPI cards with trend indicators (vs previous period)
  - Advanced date filtering with presets (Today, Yesterday, Last 7/30 Days)
  - Revenue breakdown (Dine-in vs Takeaway, by Category)
  - Customer behavior analysis (New vs Returning, AOV, popular items by time slot)
  - Prep time intelligence (by hour, per item, slow items identification)
  - AI-generated insights panel with actionable recommendations
  - Tomorrow's forecast (expected orders, peak hour, top items)
  - Smart alerts system (surge detection, prep time thresholds, retention alerts)
  - Conversational analytics ("Ask Analytics" - natural language queries)
- **☕ Coffee Management**: Full CRUD for coffee menu items with image uploads
- **🎨 Art Management**: Manage art listings, pricing, availability, and artist information
- **🎓 Workshop Management**: Create and manage workshops, view registrations, manage seat bookings
- **📋 Franchise Enquiries**: View and manage franchise enquiries with status tracking (New, Contacted, Qualified, Rejected)
- **🎁 Daily Offers Management**: Create and manage promotional offers with date ranges and discount types
- **🖼️ Site Media Management**: Configure images and videos for different sections (hero backgrounds, story visuals, etc.)
- **📦 Orders Management**: View all orders, update status, manage counter orders, view receipts
- **⚙️ Settings**: Change admin password securely

### Ordering System

- **QR Code Ordering**: Self-service ordering via QR code with Razorpay payment integration
- **Counter Ordering**: Salesperson-assisted ordering for walk-in customers (cash payment)
- **Sequential Order Numbers**: Unique order numbers starting from 00000000001
- **Daily Token Numbers**: Daily counter that resets at midnight for easy customer tracking
- **Payment Tracking**: Payment status (Paid/Pending/Failed) with payment method (Razorpay/Cash)
- **Receipt Generation**: Digital receipts with order details, payment status, and token number

### Media Management

- **Cloudinary Integration**: Image and video uploads with automatic optimization
- **Image Upload**: Support for menu items, art pieces, workshop covers
- **Video Upload**: Hero backgrounds, workshop promo videos, story section videos
- **Site Media System**: Configurable media slots for different page sections

### Email & Communication

- **Email Service**: Nodemailer integration with Gmail
- **OTP System**: Email-based OTP verification for workshop registrations
- **Workshop Confirmations**: Email notifications with confirmation codes
- **Franchise Enquiry Notifications**: Email alerts for new franchise enquiries

### 📧 Customer Email Engagement System

A comprehensive, consent-based email marketing system designed to convert one-time customers into repeat customers through relevant, ethical email communications.

#### Key Features

- **✅ Explicit Consent Required**: Customers must explicitly opt-in during order placement
- **📊 Auto-Generated Customer Tags**: Intelligent tagging system based on customer behavior:
  - `new_customer` - First-time customers
  - `returning_customer` - Customers with multiple orders
  - `coffee_lover` - Customers who primarily order coffee items
  - `workshop_interested` - Customers who registered for workshops
  - `high_value` - Customers with total spend above threshold (default: ₹5000)
  - `inactive_30_days` - Customers with no orders in last 30 days
- **🎯 Targeted Email Campaigns**: Send relevant emails based on customer tags
- **📨 Automatic Notifications**: Emails sent automatically when:
  - New coffee items are added (prioritizes `coffee_lover` tag)
  - New daily offers are created and activated
  - New workshops are created and activated (prioritizes `workshop_interested` tag)
- **🛡️ Privacy-First**: 
  - No emails sent without explicit consent
  - Unsubscribe link in every email
  - No auto-subscription
  - Respects user privacy strictly

#### Email Types Supported

1. **New Coffee Item Announcement**
   - Triggered when admin creates a new coffee item
   - Sent to customers with marketing consent
   - Optionally filters by `coffee_lover` tag
   - Includes coffee name, description, strength, flavor notes
   - Call-to-action: "View Menu"

2. **Daily Offer Announcement**
   - Triggered when new offer is created and activated
   - Sent to all subscribed customers
   - Includes offer title, discount details, validity date
   - Creates sense of urgency
   - Call-to-action: "Order Now"

3. **Workshop Announcement**
   - Triggered when new workshop is created and activated
   - Prioritizes customers with `workshop_interested` tag
   - Includes workshop title, date, time, instructor, price
   - Shows limited seats remaining
   - Call-to-action: "Register Now"

#### Admin Features

- **Customer Engagement Dashboard**: 
  - Total subscribed customers count
  - Subscription percentage
  - Breakdown by customer tags
- **Manual Email Triggers**: 
  - Send notifications manually for any content
  - Filter by customer tags for targeted campaigns
  - Preview email functionality
- **Analytics**: Track email engagement and customer segments

#### Implementation Details

- **Consent Collection**: Checkbox during order placement (QR + Counter)
- **Tag Auto-Update**: Tags updated automatically after each order
- **Batch Email Sending**: Sequential sending with rate limiting to avoid overwhelming email service
- **Error Handling**: Comprehensive error logging and graceful failures
- **Future-Ready**: Extensible architecture for WhatsApp, SMS, loyalty points, and personalization

#### Ethical Considerations

- ✅ **Explicit Consent**: No auto-subscription, checkbox is unchecked by default
- ✅ **Easy Unsubscribe**: Every email includes unsubscribe link
- ✅ **No Spam**: Only relevant, consent-based emails
- ✅ **Privacy Respect**: Never share customer data, strict consent enforcement
- ✅ **Transparent**: Clear messaging about what customers will receive

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **React Router DOM** - Navigation and protected routes
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Recharts** - Data visualization for analytics
- **Axios** - HTTP client with interceptors for JWT
- **Razorpay** - Payment gateway integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcrypt** - Password hashing
- **Razorpay SDK** - Payment processing

### Third-Party Services
- **Google Gemini API** - AI coffee discovery and chatbot
- **Cloudinary** - Media storage and optimization
- **Nodemailer** - Email service (Gmail)
- **Google Calendar API** - Workshop calendar integration
- **Google Maps Embed API** - Map display on home page
- **Google Places API** - Google Reviews integration
- **Razorpay** - Payment gateway

## 📁 Project Structure

```
rabuste-coffee/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # API client with JWT interceptor
│   │   ├── assets/                   # Images and logos
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.js            # Navigation with auth state
│   │   │   ├── Chatbot.js           # AI chatbot component
│   │   │   ├── CoffeeDiscovery.js   # AI coffee recommendation
│   │   │   ├── OrderAnalytics.js    # AI-powered analytics dashboard
│   │   │   ├── OrdersManagement.js  # Orders management
│   │   │   ├── ImageUpload.js        # Cloudinary image upload
│   │   │   ├── VideoUpload.js        # Cloudinary video upload
│   │   │   ├── OTPModal.js           # OTP verification modal
│   │   │   ├── ProtectedRoute.js    # Route protection component
│   │   │   └── VideoPlayer.js        # Video background player
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.js              # Home page with hero & offers
│   │   │   ├── About.js             # About page
│   │   │   ├── WhyRobusta.js        # Educational content
│   │   │   ├── CoffeeMenu.js        # Menu with AI discovery
│   │   │   ├── ArtGallery.js        # Art gallery
│   │   │   ├── Workshops.js         # Workshops with registration
│   │   │   ├── Franchise.js         # Franchise enquiry form
│   │   │   ├── Order.js             # QR code ordering page
│   │   │   ├── CounterOrder.js      # Counter ordering page
│   │   │   ├── YourOrders.js        # Customer order history
│   │   │   ├── AdminPanel.js        # Admin dashboard (protected)
│   │   │   └── AdminLogin.js        # Admin login page
│   │   ├── utils/
│   │   │   └── customerAuth.js      # Customer authentication utilities
│   │   ├── App.js                    # Main app with routing
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   │   ├── Admin.js       # Admin user model (with password hashing)
│   │   ├── Coffee.js      # Coffee menu items
│   │   ├── Art.js         # Art gallery pieces
│   │   ├── Workshop.js     # Workshop details
│   │   ├── WorkshopRegistration.js  # Workshop registrations
│   │   ├── FranchiseEnquiry.js     # Franchise enquiries
│   │   ├── Offer.js       # Daily offers
│   │   ├── SiteMedia.js   # Site media configuration
│   │   ├── Order.js       # Order model
│   │   ├── OrderCounter.js # Order number and token counter
│   │   ├── Customer.js    # Customer model
│   │   └── OTP.js         # OTP verification codes
│   ├── routes/            # API routes
│   │   ├── adminAuth.js   # Admin authentication (login, change-password)
│   │   ├── admin.js       # Protected admin routes (stats, analytics, registrations)
│   │   ├── coffee.js      # Coffee CRUD operations
│   │   ├── art.js         # Art CRUD operations
│   │   ├── workshops.js   # Workshop CRUD and registration
│   │   ├── franchise.js   # Franchise enquiry handling
│   │   ├── offers.js      # Daily offers management
│   │   ├── siteMedia.js   # Site media management
│   │   ├── ai.js          # AI endpoints (coffee discovery, chatbot)
│   │   ├── email.js       # Email service endpoints
│   │   ├── upload.js      # File upload endpoints
│   │   ├── orders.js      # Order endpoints
│   │   ├── payment.js     # Razorpay payment endpoints
│   │   └── customers.js   # Customer endpoints
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── services/
│   │   ├── cloudinaryService.js  # Cloudinary integration
│   │   ├── emailService.js       # Email service (Nodemailer)
│   │   ├── analyticsService.js   # Advanced analytics service
│   │   └── aiInsightsService.js  # AI insights generation
│   ├── utils/
│   │   └── calendar.js     # Google Calendar integration
│   ├── scripts/
│   │   └── seedAdmin.js   # One-time admin user creation script
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json           # Root package.json
├── README.md              # This file
├── SETUP.md               # Setup and installation guide
└── TROUBLESHOOTING.md     # Troubleshooting guide
```

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google Gemini API Key** (Get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- **Cloudinary Account** (for media storage - [Sign up](https://cloudinary.com))
- **Razorpay Account** (for payments - [Sign up](https://razorpay.com))
- **Gmail Account** (for email service - requires App Password)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coffee
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. **Set up environment variables** (see SETUP.md for details)

4. **Create initial admin user**
   ```bash
   cd server
   npm run seed:admin
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Admin Login: http://localhost:3000/admin/login

## 📡 API Endpoints

### Public Endpoints

#### Coffee
- `GET /api/coffee` - Get all coffee items
- `GET /api/coffee/:id` - Get single coffee item

#### Art
- `GET /api/art` - Get all art pieces
- `GET /api/art/:id` - Get single art piece

#### Workshops
- `GET /api/workshops` - Get all workshops
- `GET /api/workshops/:id` - Get single workshop
- `POST /api/workshops/:id/register` - Register for workshop

#### Franchise
- `POST /api/franchise/enquiry` - Submit franchise enquiry

#### Offers
- `GET /api/offers` - Get all offers
- `GET /api/offers?active=true` - Get active offers only

#### Site Media
- `GET /api/site-media` - Get site media
- `GET /api/site-media?page=home&section=hero_background` - Filtered media

#### AI
- `POST /api/ai/coffee-discovery` - AI coffee recommendation
- `POST /api/ai/chatbot` - Chatbot conversation

#### Email
- `POST /api/email/send-otp` - Send OTP email
- `POST /api/email/verify-otp` - Verify OTP code

#### Orders
- `POST /api/orders` - Create order (public)
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/:id/receipt` - Get order receipt

#### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment signature

### Admin Endpoints (Protected - Require JWT)

#### Authentication
- `POST /api/admin/auth/login` - Admin login (public)
- `POST /api/admin/auth/change-password` - Change password (protected)

#### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/analytics` - Get analytics data

#### Analytics (AI-Powered)
- `GET /api/admin/orders/analytics` - Enhanced analytics with advanced metrics
- `GET /api/admin/analytics/insights` - AI-generated insights
- `GET /api/admin/analytics/forecast` - Tomorrow's forecast
- `POST /api/admin/analytics/ask` - Conversational analytics queries
- `GET /api/admin/analytics/alerts` - Smart alerts

#### Coffee (Admin)
- `POST /api/coffee` - Create coffee item
- `PUT /api/coffee/:id` - Update coffee item
- `DELETE /api/coffee/:id` - Delete coffee item

#### Art (Admin)
- `POST /api/art` - Create art piece
- `PUT /api/art/:id` - Update art piece
- `DELETE /api/art/:id` - Delete art piece

#### Workshops (Admin)
- `POST /api/workshops` - Create workshop
- `PUT /api/workshops/:id` - Update workshop
- `DELETE /api/workshops/:id` - Delete workshop
- `GET /api/admin/registrations` - Get all registrations
- `DELETE /api/admin/registrations/:id` - Delete registration

#### Franchise (Admin)
- `GET /api/franchise/enquiries` - Get all enquiries
- `GET /api/franchise/enquiries/:id` - Get single enquiry
- `PUT /api/franchise/enquiries/:id` - Update enquiry status

#### Offers (Admin)
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer

#### Site Media (Admin)
- `POST /api/site-media` - Create media entry
- `PUT /api/site-media/:id` - Update media entry
- `DELETE /api/site-media/:id` - Delete media entry

#### Orders (Admin)
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/confirm-payment` - Confirm counter order payment
- `PUT /api/orders/:id/estimated-prep-time` - Update prep time

#### Upload
- `POST /api/upload/image` - Upload image to Cloudinary
- `POST /api/upload/video` - Upload video to Cloudinary

## 🗄️ Database Schema

### Admin
- `email` (unique, required)
- `password` (hashed, required, min 8 chars)
- `createdAt`, `updatedAt` (timestamps)

### Coffee
- `name`, `description`, `category` (Coffee/Shakes/Sides/Tea)
- `subcategory` (Hot/Cold for Coffee)
- `milkType` (Milk/Non-Milk for Coffee)
- `strength` (Mild/Medium/Strong/Extra Strong)
- `flavorNotes` (array), `price`, `priceBlend`, `priceRobustaSpecial`
- `isBestseller`, `prepTime`
- `image`, `cloudinary_url`, `cloudinary_public_id`
- `order` (for sorting)

### Art
- `title`, `artistName`, `artistStory`, `description`
- `price`, `availability` (Available/Sold/Reserved)
- `image`, `cloudinary_url`, `cloudinary_public_id`
- `dimensions`, `category`

### Workshop
- `title`, `description`, `type` (Coffee Workshop/Art & Creativity/Community Session)
- `date`, `time`, `duration`, `maxSeats`, `bookedSeats`
- `price`, `instructor`
- `image`, `cloudinary_url`, `cloudinary_public_id`
- `video_url`, `cloudinary_video_public_id`
- `isActive`

### WorkshopRegistration
- `workshopId` (ref to Workshop)
- `name`, `email`, `phone`, `message`
- `status` (Pending/Confirmed/Cancelled)
- `confirmationCode`, `otpVerified`
- `createdAt`, `updatedAt`

### FranchiseEnquiry
- `name`, `email`, `phone`, `location`
- `investmentRange`, `experience`, `message`
- `status` (New/Contacted/Qualified/Rejected)
- `createdAt`, `updatedAt`

### Offer
- `title`, `subtitle`, `description`, `badgeText`
- `discountValue`, `discountUnit` (percent/flat)
- `terms`, `startDate`, `endDate`
- `isActive`, `highlight`, `order`

### SiteMedia
- `page` (home/about/coffee/art/workshops/franchise)
- `section` (e.g., home_hero_background, home_story_coffee)
- `label`, `mediaType` (image/video)
- `url`, `cloudinary_public_id`
- `usage`, `order`, `isActive`

### Order
- `orderNumber` (sequential, unique)
- `tokenNumber` (daily counter)
- `tableNumber` (optional, for dine-in)
- `orderSource` (Counter/QR)
- `paymentStatus` (Paid/Pending/Failed)
- `paymentMethod` (Cash/Razorpay/Other)
- `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`
- `items` (array of order items)
- `subtotal`, `tax`, `total`
- `status` (Pending/Preparing/Ready/Completed/Cancelled)
- `estimatedPrepTime`
- `customerMobile`, `customer` (ref to Customer), `customerName`, `customerEmail`
- `notes`, `completedAt`, `receiptGenerated`
- `createdAt`, `updatedAt`

### Customer
- `mobile` (unique, required, Indian format)
- `name`, `email`
- `orders` (array of Order refs)
- `totalOrders`, `totalSpent`, `lastOrderDate`
- `favorites` (array of Coffee refs)
- `createdAt`, `updatedAt`

### OTP
- `email`, `code`, `purpose` (workshop_registration, etc.)
- `expiresAt`, `verified`
- `createdAt`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based admin authentication
- **Password Hashing** - bcrypt with 10 salt rounds
- **Protected Routes** - All admin APIs require valid JWT
- **Environment Variables** - Sensitive data stored in `.env` files
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Controlled cross-origin requests
- **No Public Signup** - Admin accounts created manually
- **Secure Password Change** - Requires current password verification
- **Payment Verification** - Razorpay signature verification for security

## 🎨 Design Philosophy

The application features a **bold yet cozy** café experience with:
- **Dark coffee-inspired theme** with warm browns, creams, and amber accents
- **Large typography** for impact and readability
- **Scroll-based storytelling** creating immersive experiences
- **Smooth transitions** and hover animations
- **Mobile-first design** ensuring accessibility on all devices
- **Configurable media** - Hero videos/images, story section visuals

## 📊 Analytics Dashboard Features

The AI-powered analytics dashboard includes:

### Enhanced KPIs
- Total Orders, Revenue, Avg Prep Time, Peak Hour
- Trend indicators showing % change vs previous period
- Color-coded trends (green for positive, red for negative)
- Clickable cards for future drill-down functionality

### Advanced Analytics
- **Revenue Breakdown**: Dine-in vs Takeaway, by Category (Coffee/Shakes/Sides/Tea)
- **Customer Behavior**: New vs Returning customers, Average Order Value, Popular items by time slot
- **Prep Time Intelligence**: Average prep time by hour, per item analysis, slow items identification
- **Orders by Status**: Visual status cards with counts

### AI-Powered Features
- **AI Insights Panel**: Auto-generated actionable insights using Google Gemini
- **Tomorrow's Forecast**: Expected orders, predicted peak hour, top items to prepare
- **Smart Alerts**: Real-time alerts for order surges, prep time thresholds, customer retention
- **Conversational Analytics**: Natural language queries like "Why were orders low yesterday?"

### Enhanced Charts
- Orders per hour with metric toggle (Orders/Revenue/Prep Time)
- Horizontal bar chart for top items with percentages
- Revenue breakdown pie charts
- Prep time analysis charts

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the `build` folder

3. Set environment variable:
   - `REACT_APP_API_URL` - Your production backend URL
   - `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key
   - `REACT_APP_GOOGLE_PLACE_ID` - Google Place ID for reviews

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables in your hosting platform (see SETUP.md)

2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)

3. Deploy the `server` folder

4. Run seed script on production (one-time):
   ```bash
   npm run seed:admin
   ```

## 📝 Scripts

### Server Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed:admin` - Create initial admin user

### Client Scripts
- `npm start` - Start development server
- `npm run build` - Build for production

### Root Scripts
- `npm run dev` - Start both frontend and backend concurrently

## 🎯 Key Highlights

1. **Complete MERN Stack Implementation** - Fully functional frontend and backend
2. **Secure Admin Authentication** - JWT-based with password hashing
3. **AI Integration** - Google Gemini API for coffee discovery, chatbot, and analytics insights
4. **Advanced Analytics** - AI-powered analytics dashboard with predictions and recommendations
5. **Payment Integration** - Razorpay for secure online payments
6. **Media Management** - Cloudinary integration for images and videos
7. **Email Service** - OTP verification and notifications
8. **Admin Panel** - Comprehensive content management system
9. **Beautiful UI/UX** - Premium design with smooth animations
10. **Mobile-First** - Responsive design for all devices
11. **Production-Ready Structure** - Clean code, modular components, proper error handling
12. **Configurable Content** - Site media system for flexible content management

## 🤝 Contributing

This project was built for Google Winter of Code Track 4. Contributions and improvements are welcome!

## 📄 License

This project is open source and available for educational purposes.

## 👥 Credits

Built with ❤️ for **Rabuste Coffee** - Celebrating Bold Robusta Coffee × Art × Technology

---

**Note**: This is a production-ready project with proper authentication, error handling, and security measures. Always change default admin credentials and use strong secrets in production.

For setup instructions, see [SETUP.md](./SETUP.md)

For troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
