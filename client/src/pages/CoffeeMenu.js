import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [backgroundMedia, setBackgroundMedia] = useState(null);

  useEffect(() => {
    fetchAllItems();
    fetchBackground();
  }, []);

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
      const [coffeeRes, shakesRes, sidesRes] = await Promise.all([
        api.get('/coffee', { params: { category: 'Coffee', _t: Date.now() } }),
        api.get('/coffee', { params: { category: 'Shakes', _t: Date.now() } }),
        api.get('/coffee', { params: { category: 'Sides', _t: Date.now() } })
      ]);
      
      setCoffees(coffeeRes.data || []);
      setShakes(shakesRes.data || []);
      setSides(sidesRes.data || []);
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

  return (
    <div className="pt-20 min-h-screen">
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
            Explore our curated selection of coffee, shakes, and sides
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
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="space-y-16">
          {/* Coffee Category Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <InfiniteSlider
              items={coffeeSliderItems}
              title="Coffee"
              onNavigate={() => navigate('/coffee/category')}
              speed={0.6}
            />
          </motion.div>

          {/* Shakes Category Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InfiniteSlider
              items={shakesSliderItems}
              title="Shakes"
              onNavigate={() => navigate('/coffee/shakes')}
              speed={0.54}
            />
          </motion.div>

          {/* Sides Category Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <InfiniteSlider
              items={sidesSliderItems}
              title="Sides"
              onNavigate={() => navigate('/coffee/sides')}
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
