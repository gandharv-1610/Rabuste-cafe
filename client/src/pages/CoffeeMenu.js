import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import CoffeeDiscovery from '../components/CoffeeDiscovery';
import VideoPlayer from '../components/VideoPlayer';
import InfiniteSlider from '../components/InfiniteSlider';

const CoffeeMenu = () => {
  const navigate = useNavigate();
  const [coffees, setCoffees] = useState([]);
  const [shakes, setShakes] = useState([]);
  const [sides, setSides] = useState([]);
  const [tea, setTea] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundMedia, setBackgroundMedia] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const categoryRefs = {
    coffee: useRef(null),
    shakes: useRef(null),
    tea: useRef(null),
    sides: useRef(null),
  };

  // Category configuration with subtitles and colors
  const categories = [
    {
      id: 'coffee',
      title: 'Coffee',
      subtitle: 'Bold brews & handcrafted classics',
      accentColor: 'coffee-amber',
      route: '/coffee/category',
      ref: categoryRefs.coffee
    },
    {
      id: 'shakes',
      title: 'Shakes',
      subtitle: 'Creamy delights & refreshing blends',
      accentColor: 'pink-400',
      route: '/coffee/shakes',
      ref: categoryRefs.shakes
    },
    {
      id: 'tea',
      title: 'Tea',
      subtitle: 'Aromatic infusions & soothing moments',
      accentColor: 'green-400',
      route: '/coffee/tea',
      ref: categoryRefs.tea
    },
    {
      id: 'sides',
      title: 'Sides',
      subtitle: 'Perfect pairings & savory treats',
      accentColor: 'coffee-gold',
      route: '/coffee/sides',
      ref: categoryRefs.sides
    }
  ];

  useEffect(() => {
    fetchAllItems();
    fetchBackground();
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await api.get('/billing/offers/active', {
        params: { _t: Date.now() },
      });
      setOffers(response.data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  // Intersection Observer for active category highlighting
  useEffect(() => {
    const observers = categories.map((category) => {
      if (!category.ref.current) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              setActiveCategory(category.id);
            }
          });
        },
        {
          threshold: [0.3, 0.5, 0.7],
          rootMargin: '-100px 0px -50% 0px'
        }
      );

      observer.observe(category.ref.current);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coffees, shakes, tea, sides]);

  const fetchBackground = async () => {
    try {
      let response = await api.get('/site-media', {
        params: { page: 'coffee', _t: Date.now() },
      });
      let entries = response.data || [];
      
      if (entries.length === 0) {
        response = await api.get('/site-media', {
          params: { _t: Date.now() },
        });
        const allEntries = response.data || [];
        entries = allEntries.filter((m) => 
          m.page && m.page.toLowerCase().trim() === 'coffee'
        );
      }
      
      const activeEntries = entries.filter((m) => m.isActive !== false);
      let background = activeEntries.find((m) => 
        m.section && m.section.trim() === 'coffee_hero_background'
      );
      
      if (!background && activeEntries.length > 0) {
        background = activeEntries[0];
      }
      
      if (background && background.url) {
        setBackgroundMedia(background);
      } else {
        setBackgroundMedia(null);
      }
    } catch (error) {
      console.error('Error fetching coffee background:', error);
      setBackgroundMedia(null);
    }
  };

  const fetchAllItems = async () => {
    try {
      const [coffeeRes, shakesRes, sidesRes, teaRes] = await Promise.all([
        api.get('/coffee', { params: { category: 'Coffee', _t: Date.now() } }),
        api.get('/coffee', { params: { category: 'Shakes', _t: Date.now() } }),
        api.get('/coffee', { params: { category: 'Sides', _t: Date.now() } }),
        api.get('/coffee', { params: { category: 'Tea', _t: Date.now() } })
      ]);
      
      setCoffees(coffeeRes.data || []);
      setShakes(shakesRes.data || []);
      setSides(sidesRes.data || []);
      setTea(teaRes.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Shuffle array for random order
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random items for slider (max 6 items)
  const getSliderItems = (items) => {
    const itemsWithImages = items.filter(item => item.cloudinary_url || item.image);
    const shuffled = shuffleArray(itemsWithImages);
    return shuffled.slice(0, 6);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-coffee-amber text-xl">Loading menu...</div>
      </div>
    );
  }

  const coffeeSliderItems = getSliderItems(coffees);
  const shakesSliderItems = getSliderItems(shakes);
  const sidesSliderItems = getSliderItems(sides);
  const teaSliderItems = getSliderItems(tea);

  const handleCategoryClick = (route) => {
    // Smooth transition effect
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0.95';
    setTimeout(() => {
      navigate(route);
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    }, 150);
  };

  const scrollToCategory = (categoryId) => {
    const ref = categoryRefs[categoryId];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-20 min-h-screen relative">
      {/* Sticky Category Switcher */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-20 z-30 bg-coffee-darkest/95 backdrop-blur-md border-b border-coffee-brown/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              const accentColors = {
                coffee: { bg: '#FF6F00', text: '#0F0805' },
                shakes: { bg: '#F472B6', text: '#0F0805' },
                tea: { bg: '#4ADE80', text: '#0F0805' },
                sides: { bg: '#FFB300', text: '#0F0805' }
              };
              const accent = accentColors[category.id] || accentColors.coffee;
              
              return (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-coffee-darkest shadow-lg scale-105'
                      : 'text-coffee-light hover:text-coffee-amber hover:bg-coffee-brown/20'
                  }`}
                  style={isActive ? { backgroundColor: accent.bg, color: accent.text } : {}}
                >
                  {category.title}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 min-h-[60vh] flex items-center justify-center overflow-hidden">
        {backgroundMedia && backgroundMedia.mediaType === 'video' ? (
          <VideoPlayer
            videoUrl={backgroundMedia.url}
            autoplay={true}
            muted={true}
            className="absolute inset-0 z-0"
          />
        ) : backgroundMedia && backgroundMedia.url ? (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundMedia.url}${backgroundMedia.url.includes('?') ? '&' : '?'}v=${backgroundMedia.updatedAt || Date.now()})`,
            }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-coffee-darker to-coffee-dark"></div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-coffee-darkest/90 via-coffee-darker/75 to-coffee-dark/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/5 via-transparent to-coffee-gold/5 z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center relative z-20"
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-coffee-amber mb-6">
            Our Menu
          </h1>
          <p className="text-xl text-coffee-light mb-8">
            Explore our curated selection of coffee, tea, shakes, and sides
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/order')}
              className="bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Order Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/pre-order')}
              className="bg-gradient-to-r from-coffee-brown to-coffee-dark text-coffee-cream px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border-2 border-coffee-amber/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pre-Order
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Fixed AI Discovery Button */}
      {!isDiscoveryOpen && (
        <button
          onClick={() => setIsDiscoveryOpen(true)}
          className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker px-4 md:px-6 py-3 md:py-4 rounded-l-full rounded-r-full shadow-2xl hover:shadow-coffee-amber/50 transition-all duration-300 hover:scale-110 flex items-center gap-2 md:gap-3 font-bold text-sm md:text-base group"
          style={{ boxShadow: '0 10px 40px rgba(255, 140, 0, 0.3)' }}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="hidden md:inline">AI Discovery</span>
          <span className="md:hidden">AI</span>
          <motion.div
            className="absolute inset-0 rounded-full bg-coffee-gold opacity-0 group-hover:opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </button>
      )}

      {/* Animated Discovery Sidebar */}
      <AnimatePresence>
        {isDiscoveryOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsDiscoveryOpen(false)}
              className="fixed inset-0 bg-coffee-darkest/80 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px] bg-coffee-darkest z-50 shadow-2xl overflow-y-auto"
              style={{ boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)' }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-coffee-darkest border-b border-coffee-amber/20 p-4 md:p-6 flex items-center justify-between z-10 backdrop-blur-sm">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-coffee-amber flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Coffee Discovery
                </h2>
                <button
                  onClick={() => setIsDiscoveryOpen(false)}
                  className="p-2 rounded-full hover:bg-coffee-brown/30 text-coffee-light hover:text-coffee-amber transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                <CoffeeDiscovery />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Daily Offers Section */}
      {offers.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-coffee-amber/3 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xs uppercase tracking-[0.4em] text-coffee-gold/90 mb-2 font-bold"
                style={{ letterSpacing: '0.4em' }}
              >
                TODAY AT RABUSTE
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber bg-clip-text text-transparent mb-2 leading-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                Daily Offers & Specials
              </motion.h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto mt-3 h-0.5 w-20 bg-gradient-to-r from-transparent via-coffee-amber to-transparent rounded-full"
              ></motion.div>
            </motion.div>

            {/* Enhanced Offer Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {offers.slice(0, 6).map((offer, idx) => {
                const startDate = offer.startDate ? new Date(offer.startDate) : null;
                const endDate = offer.endDate ? new Date(offer.endDate) : null;
                const formatDateShort = (date) => {
                  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                };

                return (
                  <motion.div
                    key={offer._id}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.4 + (idx * 0.1),
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -8, 
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="relative group"
                  >
                    {/* Card Container */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-coffee-darker/95 via-coffee-brown/80 to-coffee-dark/95 border-2 border-coffee-amber/40 shadow-xl hover:shadow-[0_15px_40px_rgba(255,111,0,0.12)] hover:border-coffee-amber/60 px-5 py-5 md:px-6 md:py-6 flex flex-col h-full transition-all duration-500 overflow-hidden backdrop-blur-sm">
                      {/* Gradient Overlay Inside Card */}
                      <div className="absolute inset-0 bg-gradient-to-br from-coffee-amber/8 via-transparent to-coffee-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Subtle Glow Pulse Animation */}
                      <div className="absolute inset-0 bg-gradient-to-br from-coffee-amber/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 animate-pulse-slow pointer-events-none"></div>
                      
                      {/* Badge - Limited Time */}
                      <div className="relative z-10 mb-3 flex items-start justify-between">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-red-500/30"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Limited Time
                        </motion.span>
                        {offer.isActive && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + (idx * 0.1) }}
                            className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border border-green-500/30"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Active
                          </motion.span>
                        )}
                      </div>

                      {/* Discount Value - Most Prominent */}
                      {offer.discountValue > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + (idx * 0.1), type: "spring", stiffness: 200 }}
                          className="relative z-10 mb-3"
                        >
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl md:text-5xl font-heading font-black text-coffee-amber leading-none drop-shadow-lg" style={{ textShadow: '0 0 15px rgba(255, 111, 0, 0.25)' }}>
                              {offer.offerType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                            </span>
                            <span className="text-xl md:text-2xl font-heading font-bold text-coffee-gold">OFF</span>
                          </div>
                          <div className="mt-1 h-0.5 w-16 bg-gradient-to-r from-coffee-amber to-coffee-gold rounded-full"></div>
                        </motion.div>
                      )}

                      {/* Title */}
                      <div className="relative z-10 mb-2">
                        <h3 className="text-lg md:text-xl font-heading font-bold text-coffee-amber mb-1 leading-tight group-hover:text-coffee-gold transition-colors duration-300">
                          {offer.name}
                        </h3>
                      </div>

                      {/* Description */}
                      {offer.description && (
                        <p className="relative z-10 text-xs text-coffee-light/90 mb-3 line-clamp-2 leading-relaxed">
                          {offer.description}
                        </p>
                      )}

                      {/* Min Order Amount */}
                      {offer.minOrderAmount > 0 && (
                        <p className="relative z-10 text-[11px] text-coffee-light/70 mb-3 italic">
                          Min order: ₹{offer.minOrderAmount}
                        </p>
                      )}

                      {/* Enhanced Date Presentation */}
                      <div className="relative z-10 mt-auto pt-3 border-t border-coffee-amber/20">
                        <div className="flex items-center gap-2 text-xs text-coffee-light/80">
                          <svg className="w-4 h-4 text-coffee-amber flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {startDate && endDate ? (
                              <>
                                <span className="text-coffee-amber">{formatDateShort(startDate)}</span>
                                <span className="mx-2 text-coffee-light/60">→</span>
                                <span className="text-coffee-amber">{formatDateShort(endDate)}</span>
                              </>
                            ) : startDate ? (
                              <>
                                From <span className="text-coffee-amber">{formatDateShort(startDate)}</span>
                              </>
                            ) : (
                              'Valid now'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Category Sliders Section */}
      <section className="py-12 md:py-20 px-4 max-w-7xl mx-auto">
        <div className="space-y-20 md:space-y-28">
          {/* Coffee Category Slider */}
          <motion.div
            ref={categoryRefs.coffee}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {/* Section Header */}
            <div className="mb-10 md:mb-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-coffee-amber mb-3 tracking-tight">
                  Coffee
                </h2>
                <p className="text-lg md:text-xl text-coffee-light/80 font-light tracking-wide">
                  Bold brews & handcrafted classics
                </p>
                <motion.div
                  className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-coffee-amber to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </motion.div>
            </div>

            <InfiniteSlider
              items={coffeeSliderItems}
              title="Coffee"
              onNavigate={() => handleCategoryClick('/coffee/category')}
              speed={0.6}
            />
          </motion.div>

          {/* Divider */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-coffee-brown/30 to-transparent" />

          {/* Shakes Category Slider */}
          <motion.div
            ref={categoryRefs.shakes}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {/* Section Header */}
            <div className="mb-10 md:mb-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-pink-400 mb-3 tracking-tight">
                  Shakes
                </h2>
                <p className="text-lg md:text-xl text-coffee-light/80 font-light tracking-wide">
                  Creamy delights & refreshing blends
                </p>
                <motion.div
                  className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </motion.div>
            </div>

            <InfiniteSlider
              items={shakesSliderItems}
              title="Shakes"
              onNavigate={() => handleCategoryClick('/coffee/shakes')}
              speed={0.54}
            />
          </motion.div>

          {/* Divider */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-coffee-brown/30 to-transparent" />

          {/* Tea Category Slider */}
          <motion.div
            ref={categoryRefs.tea}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {/* Section Header */}
            <div className="mb-10 md:mb-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-green-400 mb-3 tracking-tight">
                  Tea
                </h2>
                <p className="text-lg md:text-xl text-coffee-light/80 font-light tracking-wide">
                  Aromatic infusions & soothing moments
                </p>
                <motion.div
                  className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </motion.div>
            </div>

            <InfiniteSlider
              items={teaSliderItems}
              title="Tea"
              onNavigate={() => handleCategoryClick('/coffee/tea')}
              speed={0.5}
            />
          </motion.div>

          {/* Divider */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-coffee-brown/30 to-transparent" />

          {/* Sides Category Slider */}
          <motion.div
            ref={categoryRefs.sides}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {/* Section Header */}
            <div className="mb-10 md:mb-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-coffee-gold mb-3 tracking-tight">
                  Sides
                </h2>
                <p className="text-lg md:text-xl text-coffee-light/80 font-light tracking-wide">
                  Perfect pairings & savory treats
                </p>
                <motion.div
                  className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-coffee-gold to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </motion.div>
            </div>

            <InfiniteSlider
              items={sidesSliderItems}
              title="Sides"
              onNavigate={() => handleCategoryClick('/coffee/sides')}
              speed={0.45}
            />
          </motion.div>
        </div>
      </section>

      <Chatbot />
    </div>
  );
};

export default CoffeeMenu;
