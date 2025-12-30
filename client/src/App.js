import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import WhyRobusta from './pages/WhyRobusta';
import CoffeeMenu from './pages/CoffeeMenu';
import CoffeeCategory from './pages/CoffeeCategory';
import ShakesCategory from './pages/ShakesCategory';
import SidesCategory from './pages/SidesCategory';
import TeaCategory from './pages/TeaCategory';
import ArtGallery from './pages/ArtGallery';
import Workshops from './pages/Workshops';
import Franchise from './pages/Franchise';
import Order from './pages/Order';
import PreOrder from './pages/PreOrder';
import CounterOrder from './pages/CounterOrder';
import YourOrders from './pages/YourOrders';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Crema Mesh Animated Background */}
      <div className="mesh-background">
        <div className="mesh-gradient"></div>
      </div>
      
      <div className="App min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/why-robusta" element={<WhyRobusta />} />
            <Route path="/coffee" element={<CoffeeMenu />} />
            <Route path="/coffee/category" element={<CoffeeCategory />} />
            <Route path="/coffee/shakes" element={<ShakesCategory />} />
            <Route path="/coffee/sides" element={<SidesCategory />} />
            <Route path="/coffee/tea" element={<TeaCategory />} />
            <Route path="/art" element={<ArtGallery />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/franchise" element={<Franchise />} />
            <Route path="/order" element={<Order />} />
            <Route path="/pre-order" element={<PreOrder />} />
            <Route path="/your-orders" element={<YourOrders />} />
            <Route
              path="/counter"
              element={
                <ProtectedRoute>
                  <CounterOrder />
                </ProtectedRoute>
              }
            />
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
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

