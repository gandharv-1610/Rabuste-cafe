# Rabuste Coffee - Specialty Coffee Café Platform

A complete MERN stack web application for **Rabuste Coffee**, a specialty café that celebrates bold Robusta coffee, fine art, community workshops, and innovative technology. Built for Google Winter of Code (GWOC) Track 4.

![Rabuste Coffee](https://img.shields.io/badge/Rabuste-Coffee-amber?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge)

## 🌟 Features

### Customer-Facing Features

- **🏠 Home Page**: Hero section with configurable video/image backgrounds, scroll-based storytelling, daily offers showcase, and smooth animations
- **📖 About the Café**: Story behind choosing Robusta coffee, café philosophy, and cultural inspiration
- **☕ Why Robusta?**: Educational content explaining Robusta coffee, flavor profiles, and comparisons
- **☕ Coffee Menu**: Curated Robusta-only menu with descriptions, strength levels, flavor notes, and AI-powered coffee discovery
- **🎨 Art Gallery**: Micro art gallery showcasing fine art pieces with artist stories, pricing, and availability status
- **🎓 Workshops & Experiences**: Coffee workshops, art sessions, and community events with registration system and Google Calendar integration
- **🚀 Franchise Opportunity**: Franchise information and enquiry form for potential partners with status tracking
- **🎁 Daily Offers**: Dynamic offers and specials displayed on the home page with date-based filtering

### AI-Powered Features (Google Gemini)

1. **🤖 AI Coffee Discovery**
   - Recommends perfect Robusta brew based on mood, time of day, and energy level
   - Provides personalized coffee suggestions with explanations
   - Powered by Google Gemini API

2. **💬 Smart Café Chatbot**
   - Domain-restricted chatbot answering only café-related questions
   - Helps users learn about coffee, art, workshops, and franchise
   - Redirects users to relevant pages
   - Graceful fallback when API is unavailable

### Admin Panel (JWT-Protected)

- **🔐 Secure Authentication**: JWT-based login system with password hashing (bcrypt)
- **📊 Dashboard**: Overview statistics and analytics for all content
- **☕ Coffee Management**: Full CRUD for coffee menu items with image uploads
- **🎨 Art Management**: Manage art listings, pricing, availability, and artist information
- **🎓 Workshop Management**: Create and manage workshops, view registrations, manage seat bookings
- **📋 Franchise Enquiries**: View and manage franchise enquiries with status tracking (New, Contacted, Qualified, Rejected)
- **🎁 Daily Offers Management**: Create and manage promotional offers with date ranges and discount types
- **🖼️ Site Media Management**: Configure images and videos for different sections (hero backgrounds, story visuals, etc.)
- **⚙️ Settings**: Change admin password securely

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

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **React Router DOM** - Navigation and protected routes
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client with interceptors for JWT

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcrypt** - Password hashing

### Third-Party Services
- **Google Gemini API** - AI coffee discovery and chatbot
- **Cloudinary** - Media storage and optimization
- **Nodemailer** - Email service (Gmail)
- **Google Calendar API** - Workshop calendar integration

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
│   │   │   ├── AdminPanel.js        # Admin dashboard (protected)
│   │   │   └── AdminLogin.js        # Admin login page
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
│   │   ├── Workshop.js   # Workshop details
│   │   ├── WorkshopRegistration.js  # Workshop registrations
│   │   ├── FranchiseEnquiry.js     # Franchise enquiries
│   │   ├── Offer.js       # Daily offers
│   │   ├── SiteMedia.js   # Site media configuration
│   │   └── OTP.js         # OTP verification codes
│   ├── routes/            # API routes
│   │   ├── adminAuth.js   # Admin authentication (login, change-password)
│   │   ├── admin.js       # Protected admin routes (stats, analytics, registrations)
│   │   ├── coffee.js     # Coffee CRUD operations
│   │   ├── art.js         # Art CRUD operations
│   │   ├── workshops.js  # Workshop CRUD and registration
│   │   ├── franchise.js  # Franchise enquiry handling
│   │   ├── offers.js     # Daily offers management
│   │   ├── siteMedia.js  # Site media management
│   │   ├── ai.js         # AI endpoints (coffee discovery, chatbot)
│   │   ├── email.js      # Email service endpoints
│   │   └── upload.js     # File upload endpoints
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   ├── services/
│   │   ├── cloudinaryService.js  # Cloudinary integration
│   │   └── emailService.js      # Email service (Nodemailer)
│   ├── utils/
│   │   └── calendar.js   # Google Calendar integration
│   ├── scripts/
│   │   └── seedAdmin.js  # One-time admin user creation script
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json           # Root package.json
├── README.md
├── SETUP.md
├── INSTALLATION.md
├── PROJECT_SUMMARY.md
└── GEMINI_TROUBLESHOOTING.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google Gemini API Key** (Get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- **Cloudinary Account** (for media storage - [Sign up](https://cloudinary.com))
- **Gmail Account** (for email service - requires App Password)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coffee
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   Create `server/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rabuste-coffee
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rabuste-coffee
   
   # Google Gemini API
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # JWT Secret (use a strong random string)
   JWT_SECRET=your_very_strong_random_secret_key_here
   
   # Admin Seed (optional - defaults provided)
   ADMIN_SEED_EMAIL=admin@rabuste.coffee
   ADMIN_SEED_PASSWORD=ChangeMeNow!123
   
   # Email Configuration (Nodemailer with Gmail)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   (Optional) Create `client/.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Create initial admin user**
   ```bash
   cd server
   npm run seed:admin
   ```
   This creates an admin user if none exists. Default credentials:
   - Email: `admin@rabuste.coffee` (or from `ADMIN_SEED_EMAIL`)
   - Password: `ChangeMeNow!123` (or from `ADMIN_SEED_PASSWORD`)
   
   **Important**: Change the password immediately after first login!

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the application**

   Option 1: Run both servers concurrently (from root directory):
   ```bash
   npm run dev
   ```

   Option 2: Run separately:
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Admin Login: http://localhost:3000/admin/login
   - Admin Panel: http://localhost:3000/admin (requires login)

## 🔐 Admin Authentication

### First-Time Setup

1. Run the seed script to create admin user:
   ```bash
   cd server
   npm run seed:admin
   ```

2. Log in at `/admin/login` with seeded credentials

3. **Change your password** immediately in Settings tab

### Security Features

- **JWT-based authentication** with 7-day token expiration
- **Password hashing** using bcrypt (10 salt rounds)
- **Protected routes** - All admin APIs require valid JWT token
- **Secure password change** - Requires current password verification
- **No public signup** - Admin accounts created manually via seed script

### Admin Routes

- **Public**: `POST /api/admin/auth/login` - Admin login
- **Protected**: All `/api/admin/*` routes require JWT token
- **Protected**: `POST /api/admin/auth/change-password` - Change password

## 🎨 Design Philosophy

The application features a **bold yet cozy** café experience with:
- **Dark coffee-inspired theme** with warm browns, creams, and amber accents
- **Large typography** for impact and readability
- **Scroll-based storytelling** creating immersive experiences
- **Smooth transitions** and hover animations
- **Mobile-first design** ensuring accessibility on all devices
- **Configurable media** - Hero videos/images, story section visuals

## 🤖 AI Features Explained

### 1. AI Coffee Discovery

Users input:
- **Mood**: Relaxed / Focused / Energetic
- **Time of Day**: Early Morning, Morning, Afternoon, Evening, Night
- **Energy Level**: Low, Moderate, High

The AI uses Google Gemini to analyze these inputs and recommend the perfect Robusta brew with:
- Specific coffee recommendation (Espresso, Americano, Cappuccino, etc.)
- Strength level
- Personalized explanation connecting inputs to coffee choice

### 2. Smart Café Chatbot

A domain-restricted chatbot that:
- Answers questions about coffee, art, workshops, and franchise
- Redirects users to relevant pages
- Provides café philosophy and Robusta education
- Refuses to answer off-topic questions politely
- Falls back gracefully when API is unavailable

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

### Admin Endpoints (Protected - Require JWT)

#### Authentication
- `POST /api/admin/auth/login` - Admin login (public)
- `POST /api/admin/auth/change-password` - Change password (protected)

#### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/analytics` - Get analytics data

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

#### Upload
- `POST /api/upload/image` - Upload image to Cloudinary
- `POST /api/upload/video` - Upload video to Cloudinary

## 🗄️ Database Schema

### Admin
- `email` (unique, required)
- `password` (hashed, required, min 8 chars)
- `createdAt`, `updatedAt` (timestamps)

### Coffee
- `name`, `description`, `category` (Coffee/Snacks/Merchandise/Other)
- `strength` (Mild/Medium/Strong/Extra Strong)
- `flavorNotes` (array), `price`, `isBestseller`
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

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables in your hosting platform:
   - `PORT` (usually auto-set)
   - `MONGODB_URI` - Production MongoDB connection string
   - `JWT_SECRET` - Strong random secret
   - `GOOGLE_GEMINI_API_KEY` - Your Gemini API key
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`

2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)

3. Deploy the `server` folder

4. Run seed script on production (one-time):
   ```bash
   npm run seed:admin
   ```

### Environment Variables for Production

**Backend (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
GOOGLE_GEMINI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASS=...
```

**Frontend (`client/.env`):**
```env
REACT_APP_API_URL=https://your-backend-url.com/api
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
3. **AI Integration** - Google Gemini API for coffee discovery and chatbot
4. **Media Management** - Cloudinary integration for images and videos
5. **Email Service** - OTP verification and notifications
6. **Admin Panel** - Comprehensive content management system
7. **Beautiful UI/UX** - Premium design with smooth animations
8. **Mobile-First** - Responsive design for all devices
9. **Production-Ready Structure** - Clean code, modular components, proper error handling
10. **Configurable Content** - Site media system for flexible content management

## 🤝 Contributing

This project was built for Google Winter of Code Track 4. Contributions and improvements are welcome!

## 📄 License

This project is open source and available for educational purposes.

## 👥 Credits

Built with ❤️ for **Rabuste Coffee** - Celebrating Bold Robusta Coffee × Art × Technology

---

**Note**: This is a production-ready project with proper authentication, error handling, and security measures. Always change default admin credentials and use strong secrets in production.
