import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  }, []);

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
          <p className="text-xl text-coffee-light">
            Explore our curated selection of coffee, tea, shakes, and sides
          </p>
        </motion.div>
      </section>

      {/* AI Coffee Discovery */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <CoffeeDiscovery />
        </div>
      </section>

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
