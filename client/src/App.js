import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
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
import ArtCheckout from './pages/ArtCheckout';
import OrderTracking from './pages/OrderTracking';
import MyArtOrders from './pages/MyArtOrders';
import ArtistSubmission from './pages/ArtistSubmission';
import Workshops from './pages/Workshops';
import Franchise from './pages/Franchise';
import Order from './pages/Order';
import PreOrder from './pages/PreOrder';
import CounterOrder from './pages/CounterOrder';
import YourOrders from './pages/YourOrders';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import './App.css';
import heroLogo from './assets/rabuste-logo-horizontal.png';

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      // Small delay so the transition feels smooth
      setTimeout(() => setIsAppLoading(false), 400);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      {/* Crema Mesh Animated Background */}
      <div className="mesh-background">
        <div className="mesh-gradient"></div>
      </div>
      
      <div className="App min-h-screen flex flex-col w-full overflow-x-hidden relative">
        {/* Global splash loader for first paint with logo handoff */}
        <AnimatePresence>
          {isAppLoading && (
            <motion.div
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050203] overflow-hidden"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <div className="splash-amber-bg" />
              <motion.img
                layoutId="rabuste-hero-logo"
                src={heroLogo}
                alt="Rabuste Coffee"
                className="relative w-40 md:w-56 object-contain mb-8 drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.4, y: -40 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <motion.div
                className="relative flex flex-col items-center gap-3"
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="coffee-loader-dots">
                  <span className="coffee-loader-dot" />
                  <span className="coffee-loader-dot" />
                  <span className="coffee-loader-dot" />
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-coffee-amber/80">
                  Brewing your experience
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#5D4037',
              color: '#EFEBE9',
              border: '1px solid #FF6F00',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#EFEBE9',
              },
              style: {
                background: '#1B5E20',
                border: '1px solid #4CAF50',
              },
            },
            error: {
              iconTheme: {
                primary: '#F44336',
                secondary: '#EFEBE9',
              },
              style: {
                background: '#B71C1C',
                border: '1px solid #F44336',
              },
            },
            loading: {
              iconTheme: {
                primary: '#FF6F00',
                secondary: '#EFEBE9',
              },
            },
          }}
        />
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
            <Route path="/art-gallery" element={<ArtGallery />} />
            <Route path="/art-checkout/:id" element={<ArtCheckout />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/my-art-orders" element={<MyArtOrders />} />
            <Route path="/artist-submission" element={<ArtistSubmission />} />
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

