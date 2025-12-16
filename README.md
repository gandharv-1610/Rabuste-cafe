# Rabuste Coffee - Specialty Coffee Café Platform

A complete MERN stack web application for **Rabuste Coffee**, a specialty café that celebrates bold Robusta coffee, fine art, community workshops, and innovative technology. Built for Google Winter of Code (GWOC) Track 4.

![Rabuste Coffee](https://img.shields.io/badge/Rabuste-Coffee-amber?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge)

## 🌟 Features

### Customer-Facing Features

- **🏠 Home Page**: Hero section with scroll-based storytelling showcasing café philosophy
- **📖 About the Café**: Story behind choosing Robusta coffee, café philosophy, and cultural inspiration
- **☕ Why Robusta?**: Educational content explaining Robusta coffee, flavor profiles, and comparisons
- **☕ Coffee Menu**: Curated Robusta-only menu with descriptions, strength levels, and flavor notes
- **🎨 Art Gallery**: Micro art gallery showcasing fine art pieces with artist stories and pricing
- **🎓 Workshops & Experiences**: Coffee workshops, art sessions, and community events with registration
- **🚀 Franchise Opportunity**: Franchise information and enquiry form for potential partners

### AI-Powered Features (Google Gemini)

1. **🤖 AI Coffee Discovery**
   - Recommends perfect Robusta brew based on mood, time of day, and energy level
   - Provides personalized coffee suggestions with explanations
   - Powered by Google Gemini API

2. **💬 Smart Café Chatbot**
   - Domain-restricted chatbot answering only café-related questions
   - Helps users learn about coffee, art, workshops, and franchise
   - Redirects users to relevant pages

### Admin Panel

- **📊 Dashboard**: Overview statistics and analytics
- **☕ Coffee Management**: Add, edit, delete coffee menu items
- **🎨 Art Management**: Manage art listings, pricing, and availability
- **🎓 Workshop Management**: Create and manage workshops, view registrations
- **📋 Franchise Enquiries**: View and manage franchise enquiries with status tracking

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **React Router DOM** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### AI Integration
- **Google Gemini API** - AI coffee discovery and chatbot

## 📁 Project Structure

```
rabuste-coffee/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── Chatbot.js
│   │   │   └── CoffeeDiscovery.js
│   │   ├── pages/         # Page components
│   │   │   ├── Home.js
│   │   │   ├── About.js
│   │   │   ├── WhyRobusta.js
│   │   │   ├── CoffeeMenu.js
│   │   │   ├── ArtGallery.js
│   │   │   ├── Workshops.js
│   │   │   ├── Franchise.js
│   │   │   └── AdminPanel.js
│   │   ├── api/           # API configuration
│   │   │   └── axios.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   │   ├── Coffee.js
│   │   ├── Art.js
│   │   ├── Workshop.js
│   │   ├── WorkshopRegistration.js
│   │   └── FranchiseEnquiry.js
│   ├── routes/            # API routes
│   │   ├── coffee.js
│   │   ├── art.js
│   │   ├── workshops.js
│   │   ├── franchise.js
│   │   ├── ai.js
│   │   └── admin.js
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google Gemini API Key** (Get from [Google AI Studio](https://makersuite.google.com/app/apikey))

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
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   For MongoDB Atlas, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rabuste-coffee
   ```

   (Optional) Create `client/.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**

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

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Admin Panel: http://localhost:3000/admin

## 🎨 Design Philosophy

The application features a **bold yet cozy** café experience with:
- **Dark coffee-inspired theme** with warm browns, creams, and amber accents
- **Large typography** for impact and readability
- **Scroll-based storytelling** creating immersive experiences
- **Smooth transitions** and hover animations
- **Mobile-first design** ensuring accessibility on all devices

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

## 📡 API Endpoints

### Coffee
- `GET /api/coffee` - Get all coffee items
- `GET /api/coffee/:id` - Get single coffee item
- `POST /api/coffee` - Create coffee item (Admin)
- `PUT /api/coffee/:id` - Update coffee item (Admin)
- `DELETE /api/coffee/:id` - Delete coffee item (Admin)

### Art
- `GET /api/art` - Get all art pieces
- `GET /api/art/:id` - Get single art piece
- `POST /api/art` - Create art piece (Admin)
- `PUT /api/art/:id` - Update art piece (Admin)
- `DELETE /api/art/:id` - Delete art piece (Admin)

### Workshops
- `GET /api/workshops` - Get all workshops
- `GET /api/workshops/:id` - Get single workshop
- `POST /api/workshops` - Create workshop (Admin)
- `PUT /api/workshops/:id` - Update workshop (Admin)
- `DELETE /api/workshops/:id` - Delete workshop (Admin)
- `POST /api/workshops/:id/register` - Register for workshop
- `GET /api/workshops/:id/registrations` - Get workshop registrations (Admin)

### Franchise
- `POST /api/franchise/enquiry` - Submit franchise enquiry
- `GET /api/franchise/enquiries` - Get all enquiries (Admin)
- `GET /api/franchise/enquiries/:id` - Get single enquiry (Admin)
- `PUT /api/franchise/enquiries/:id` - Update enquiry status (Admin)

### AI
- `POST /api/ai/coffee-discovery` - AI coffee recommendation
- `POST /api/ai/chatbot` - Chatbot conversation

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/registrations` - Get all workshop registrations

## 🗄️ Database Schema

### Coffee
- name, description, strength, flavorNotes, isBestseller, image, order

### Art
- title, artistName, artistStory, description, price, image, availability, category, dimensions

### Workshop
- title, description, type, date, time, duration, maxSeats, bookedSeats, price, instructor, image, isActive

### WorkshopRegistration
- workshopId, name, email, phone, message, status, confirmationCode

### FranchiseEnquiry
- name, email, phone, location, investmentRange, experience, message, status

## 🔒 Security Notes

- Environment variables should never be committed to version control
- API keys must be kept secure
- Consider adding authentication for admin routes in production
- Validate and sanitize all user inputs
- Use HTTPS in production

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the React app: `cd client && npm run build`
2. Deploy the `build` folder

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Deploy the `server` folder

### Environment Variables for Production
- Update `REACT_APP_API_URL` in client to point to production backend
- Ensure `MONGODB_URI` points to production database
- Set `GOOGLE_GEMINI_API_KEY` in backend environment

## 📝 Future Enhancements

- [ ] User authentication and profiles
- [ ] Payment integration for art purchases
- [ ] Email notifications for workshop confirmations
- [ ] Advanced analytics dashboard
- [ ] Image upload functionality
- [ ] Multi-language support
- [ ] Real-time chat support
- [ ] Coffee subscription service

## 🤝 Contributing

This project was built for Google Winter of Code Track 4. Contributions and improvements are welcome!

## 📄 License

This project is open source and available for educational purposes.

## 👥 Credits

Built with ❤️ for **Rabuste Coffee** - Celebrating Bold Robusta Coffee × Art × Technology

---

**Note**: This is a demonstration project. For production use, implement proper authentication, error handling, and security measures.

