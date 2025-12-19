# Rabuste Coffee - Project Summary

## ✅ Completed Features

### 🎨 Frontend Pages
- ✅ **Home Page** - Hero section with configurable video/image backgrounds, scroll storytelling, daily offers showcase, CTAs, and smooth animations
- ✅ **About Page** - Café concept, philosophy, and cultural inspiration
- ✅ **Why Robusta?** - Educational content with comparison tables and feature highlights
- ✅ **Coffee Menu** - Display menu items with AI Coffee Discovery integration
- ✅ **Art Gallery** - Showcase art pieces with filtering, detail modals, and availability status
- ✅ **Workshops** - Workshop listings with registration system, Google Calendar integration, and OTP verification
- ✅ **Franchise** - Franchise information and enquiry form with status tracking
- ✅ **Admin Panel** - Full CRUD management for all content (protected with JWT)
- ✅ **Admin Login** - Secure login page with JWT authentication

### 🔐 Authentication & Security
- ✅ **JWT-based Admin Authentication** - Secure token-based login system
- ✅ **Password Hashing** - bcrypt with 10 salt rounds
- ✅ **Protected Routes** - Frontend route protection with ProtectedRoute component
- ✅ **API Protection** - All admin APIs protected with JWT middleware
- ✅ **Password Change** - Secure password change feature in Admin Panel
- ✅ **Admin Seed Script** - One-time admin user creation with automatic password hashing
- ✅ **No Public Signup** - Admin accounts created manually only

### 🎨 UI/UX Features
- ✅ Dark coffee-inspired theme (warm browns, creams, amber accents)
- ✅ Framer Motion animations and transitions
- ✅ Mobile-first responsive design
- ✅ Scroll-based storytelling
- ✅ Interactive components with hover effects
- ✅ Smooth navigation with React Router
- ✅ Configurable hero backgrounds (video/image)
- ✅ Dynamic daily offers display

### 🔧 Backend Features
- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose ODM
- ✅ Complete CRUD operations for:
  - Coffee menu items (with categories: Coffee, Snacks, Merchandise, Other)
  - Art gallery pieces (with availability tracking)
  - Workshops and registrations (with seat management)
  - Franchise enquiries (with status workflow)
  - Daily offers (with date-based filtering)
  - Site media (configurable page sections)
- ✅ Admin dashboard with statistics and analytics
- ✅ Workshop registration with OTP verification
- ✅ Email service integration (Nodemailer with Gmail)
- ✅ Cloudinary integration for media storage

### 🤖 AI Features (Google Gemini)
- ✅ **AI Coffee Discovery** - Personalized coffee recommendations based on mood, time, and energy
- ✅ **Smart Café Chatbot** - Domain-restricted chatbot for café-related queries
- ✅ Graceful fallback when API unavailable

### 📱 Components
- ✅ Navbar with active route highlighting and auth state
- ✅ Chatbot component (always accessible)
- ✅ Coffee Discovery component
- ✅ ImageUpload component (Cloudinary)
- ✅ VideoUpload component (Cloudinary)
- ✅ OTPModal component (email verification)
- ✅ ProtectedRoute component (route protection)
- ✅ VideoPlayer component (background videos)
- ✅ Modal components for details
- ✅ Form components with validation

### 🖼️ Media Management
- ✅ Cloudinary image uploads
- ✅ Cloudinary video uploads
- ✅ Site media configuration system
- ✅ Hero background management (video/image)
- ✅ Story section visual management
- ✅ Automatic media optimization

### 📧 Email & Communication
- ✅ Email service (Nodemailer)
- ✅ OTP email sending
- ✅ OTP verification system
- ✅ Workshop confirmation emails
- ✅ Email notifications for franchise enquiries

### 📊 Admin Panel Features
- ✅ Dashboard with statistics (coffee, art, workshops, enquiries)
- ✅ Coffee Menu Management (CRUD with image uploads)
- ✅ Art Gallery Management (CRUD with availability tracking)
- ✅ Workshop Management (CRUD with registration viewing)
- ✅ Franchise Enquiries Management (status tracking)
- ✅ Daily Offers Management (date-based offers)
- ✅ Site Media Management (configurable media slots)
- ✅ Settings (password change)
- ✅ Analytics dashboard

## 🗂️ File Structure

```
coffee/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # API client with JWT interceptor
│   │   ├── assets/                   # Images and logos
│   │   ├── components/
│   │   │   ├── Navbar.js            # Navigation with auth state
│   │   │   ├── Chatbot.js           # AI chatbot
│   │   │   ├── CoffeeDiscovery.js   # AI coffee recommendation
│   │   │   ├── ImageUpload.js        # Cloudinary image upload
│   │   │   ├── VideoUpload.js        # Cloudinary video upload
│   │   │   ├── OTPModal.js           # OTP verification
│   │   │   ├── ProtectedRoute.js    # Route protection
│   │   │   └── VideoPlayer.js        # Video background player
│   │   ├── pages/
│   │   │   ├── Home.js              # Home with hero & offers
│   │   │   ├── About.js             # About page
│   │   │   ├── WhyRobusta.js        # Educational content
│   │   │   ├── CoffeeMenu.js         # Menu with AI discovery
│   │   │   ├── ArtGallery.js         # Art gallery
│   │   │   ├── Workshops.js          # Workshops with registration
│   │   │   ├── Franchise.js          # Franchise enquiry
│   │   │   ├── AdminPanel.js         # Admin dashboard
│   │   │   └── AdminLogin.js         # Admin login
│   │   ├── App.js                    # Main app with routing
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/
│   ├── models/
│   │   ├── Admin.js                  # Admin user model
│   │   ├── Coffee.js                 # Coffee menu items
│   │   ├── Art.js                     # Art gallery pieces
│   │   ├── Workshop.js                # Workshop details
│   │   ├── WorkshopRegistration.js   # Workshop registrations
│   │   ├── FranchiseEnquiry.js       # Franchise enquiries
│   │   ├── Offer.js                   # Daily offers
│   │   ├── SiteMedia.js              # Site media config
│   │   └── OTP.js                     # OTP codes
│   ├── routes/
│   │   ├── adminAuth.js              # Admin authentication
│   │   ├── admin.js                  # Protected admin routes
│   │   ├── coffee.js                 # Coffee CRUD
│   │   ├── art.js                    # Art CRUD
│   │   ├── workshops.js              # Workshop CRUD & registration
│   │   ├── franchise.js              # Franchise enquiries
│   │   ├── offers.js                 # Daily offers
│   │   ├── siteMedia.js              # Site media
│   │   ├── ai.js                     # AI endpoints
│   │   ├── email.js                  # Email service
│   │   └── upload.js                 # File uploads
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   ├── services/
│   │   ├── cloudinaryService.js      # Cloudinary integration
│   │   └── emailService.js           # Email service
│   ├── utils/
│   │   └── calendar.js               # Google Calendar integration
│   ├── scripts/
│   │   └── seedAdmin.js              # Admin user seed script
│   ├── index.js                      # Server entry point
│   └── package.json
├── package.json
├── README.md
├── SETUP.md
├── INSTALLATION.md
├── PROJECT_SUMMARY.md
└── GEMINI_TROUBLESHOOTING.md
```

## 🚀 Quick Start

1. Install dependencies: `npm install` (root, server, client)
2. Set up MongoDB (local or Atlas)
3. Create `server/.env` with required variables
4. Run seed script: `cd server && npm run seed:admin`
5. Run: `npm run dev` (from root)
6. Access: http://localhost:3000
7. Login: http://localhost:3000/admin/login

## 🎯 Key Highlights

1. **Complete MERN Stack Implementation** - Fully functional frontend and backend
2. **Secure Admin Authentication** - JWT-based with password hashing and protected routes
3. **AI Integration** - Google Gemini API for coffee discovery and chatbot
4. **Media Management** - Cloudinary integration for images and videos
5. **Email Service** - OTP verification and notifications
6. **Admin Panel** - Comprehensive content management system
7. **Beautiful UI/UX** - Premium design with smooth animations
8. **Mobile-First** - Responsive design for all devices
9. **Production-Ready Structure** - Clean code, modular components, proper error handling
10. **Configurable Content** - Site media system for flexible content management

## 📋 API Endpoints Summary

### Public Endpoints
- `/api/coffee` - Coffee menu
- `/api/art` - Art gallery
- `/api/workshops` - Workshops
- `/api/workshops/:id/register` - Workshop registration
- `/api/franchise/enquiry` - Franchise enquiry
- `/api/offers` - Daily offers
- `/api/site-media` - Site media
- `/api/ai/coffee-discovery` - AI coffee recommendation
- `/api/ai/chatbot` - Chatbot
- `/api/email/send-otp` - Send OTP
- `/api/email/verify-otp` - Verify OTP

### Admin Endpoints (Protected - JWT Required)
- `/api/admin/auth/login` - Admin login (public)
- `/api/admin/auth/change-password` - Change password
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/analytics` - Analytics data
- `/api/admin/registrations` - Workshop registrations
- All CRUD operations for coffee, art, workshops, offers, site-media

## 🎨 Design System

**Colors:**
- Dark: `#3E2723` (coffee-darker)
- Brown: `#5D4037` (coffee-brown)
- Medium: `#6D4C41` (coffee-medium)
- Amber: `#FF6F00` (coffee-amber)
- Gold: `#FF8F00` (coffee-gold)
- Cream: `#EFEBE9` (coffee-cream)
- Light: `#D7CCC8` (coffee-light)

**Typography:**
- Display: Playfair Display (headings)
- Body: Inter (content)

## 🔐 Security Features

- ✅ JWT Authentication with 7-day expiration
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Protected admin routes (frontend and backend)
- ✅ Secure password change (requires current password)
- ✅ Environment variables for sensitive data
- ✅ No public admin signup
- ✅ Input validation and sanitization

## 🗄️ Database Models

- **Admin** - Admin users with hashed passwords
- **Coffee** - Menu items with categories and strength levels
- **Art** - Art pieces with availability tracking
- **Workshop** - Workshop details with seat management
- **WorkshopRegistration** - Registrations with OTP verification
- **FranchiseEnquiry** - Enquiries with status workflow
- **Offer** - Daily offers with date ranges
- **SiteMedia** - Configurable media for page sections
- **OTP** - Email verification codes

## ✨ Innovation Points

1. **AI Coffee Discovery** - Personalized recommendations using Google Gemini
2. **Smart Chatbot** - Domain-restricted AI assistant
3. **Scroll Storytelling** - Immersive narrative experience
4. **Art × Coffee Fusion** - Unique combination of art gallery and café
5. **Workshop Management** - Seamless registration with seat tracking and OTP
6. **Configurable Media** - Flexible site media system for easy content updates
7. **Secure Admin System** - Production-ready authentication and authorization

## 📝 Environment Variables Required

```env
# Required
MONGODB_URI=mongodb://localhost:27017/rabuste-coffee
JWT_SECRET=your_strong_random_secret
GOOGLE_GEMINI_API_KEY=your_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional
ADMIN_SEED_EMAIL=admin@rabuste.coffee
ADMIN_SEED_PASSWORD=ChangeMeNow!123
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## 🚢 Deployment Ready

- ✅ Environment variable configuration
- ✅ Production build scripts
- ✅ Error handling and logging
- ✅ CORS configuration
- ✅ Security best practices
- ✅ Database connection pooling
- ✅ Media optimization

## 📊 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Frontend Pages | ✅ Complete | All pages implemented |
| Admin Authentication | ✅ Complete | JWT-based, secure |
| Admin Panel | ✅ Complete | Full CRUD for all content |
| AI Features | ✅ Complete | Coffee discovery & chatbot |
| Media Uploads | ✅ Complete | Cloudinary integration |
| Email Service | ✅ Complete | OTP & notifications |
| Site Media System | ✅ Complete | Configurable sections |
| Daily Offers | ✅ Complete | Date-based filtering |
| Workshop Registration | ✅ Complete | With OTP verification |
| Mobile Responsive | ✅ Complete | Mobile-first design |

## 🎉 Project Status

**Status**: ✅ **Production-Ready**

All core features implemented, tested, and documented. Ready for deployment with proper environment configuration.

---

**Built with ❤️ for Rabuste Coffee** - Celebrating Bold Robusta Coffee × Art × Technology
