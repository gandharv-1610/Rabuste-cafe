import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import WhyRobusta from './pages/WhyRobusta';
import CoffeeMenu from './pages/CoffeeMenu';
import CoffeeCategory from './pages/CoffeeCategory';
import ShakesCategory from './pages/ShakesCategory';
import SidesCategory from './pages/SidesCategory';
import ArtGallery from './pages/ArtGallery';
import Workshops from './pages/Workshops';
import Franchise from './pages/Franchise';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import './App.css';

function App() {
  return (
    <Router>
      {/* Crema Mesh Animated Background */}
      <div className="mesh-background">
        <div className="mesh-gradient"></div>
      </div>
      
      <div className="App min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/why-robusta" element={<WhyRobusta />} />
          <Route path="/coffee" element={<CoffeeMenu />} />
          <Route path="/coffee/category" element={<CoffeeCategory />} />
          <Route path="/coffee/shakes" element={<ShakesCategory />} />
          <Route path="/coffee/sides" element={<SidesCategory />} />
          <Route path="/art" element={<ArtGallery />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

