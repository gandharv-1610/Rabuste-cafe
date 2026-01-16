import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import CoffeeDiscovery from '../components/CoffeeDiscovery';
import VideoPlayer from '../components/VideoPlayer';
import InfiniteSlider from '../components/InfiniteSlider';
import CoffeeLoader from '../components/CoffeeLoader';
import DailyOffersPopup from '../components/DailyOffersPopup';

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
  const [showDiscoveryBanner, setShowDiscoveryBanner] = useState(true);
  const [offers, setOffers] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
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
        <CoffeeLoader size="lg" />
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
      {/* AI Discovery Promotional Banner */}
      <AnimatePresence>
        {showDiscoveryBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-gradient-to-r from-coffee-amber/20 via-coffee-gold/20 to-coffee-amber/20 border-b border-coffee-amber/30 px-4 py-3"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-coffee-cream font-semibold">
                    <span className="text-coffee-amber">✨ New!</span> Not sure what to order? Try our <span className="text-coffee-amber font-bold">AI Coffee Discovery</span> to find your perfect brew!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsDiscoveryOpen(true);
                    setShowDiscoveryBanner(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-lg font-bold text-sm hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg hover:shadow-xl"
                >
                  Try It Now
                </button>
                <button
                  onClick={() => setShowDiscoveryBanner(false)}
                  className="p-1 text-coffee-light hover:text-coffee-cream transition-colors"
                  aria-label="Close banner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
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
          className="fixed right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker px-4 md:px-6 py-3 md:py-4 rounded-l-full rounded-r-full shadow-2xl hover:shadow-coffee-amber/50 transition-all duration-300 hover:scale-110 flex items-center gap-2 md:gap-3 font-bold text-sm md:text-base group"
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

      <Chatbot onOpenChange={setIsChatbotOpen} />
      {!isChatbotOpen && <DailyOffersPopup />}
    </div>
  );
};

export default CoffeeMenu;
