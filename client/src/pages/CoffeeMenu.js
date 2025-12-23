import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import CoffeeDiscovery from '../components/CoffeeDiscovery';
import VideoPlayer from '../components/VideoPlayer';

const CoffeeMenu = () => {
  const [coffees, setCoffees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [backgroundMedia, setBackgroundMedia] = useState(null);
  const [flippedCards, setFlippedCards] = useState(new Set());

  useEffect(() => {
    fetchCoffees();
    fetchBackground();
  }, []);

  const fetchBackground = async () => {
    try {
      // Try fetching with exact page name
      let response = await api.get('/site-media', {
        params: { page: 'coffee', _t: Date.now() },
      });
      let entries = response.data || [];
      
      // If no results, try fetching all and filtering client-side
      if (entries.length === 0) {
        console.log('Coffee page - No results with page filter, trying all entries...');
        response = await api.get('/site-media', {
          params: { _t: Date.now() },
        });
        const allEntries = response.data || [];
        // Filter for coffee page entries (case-insensitive)
        entries = allEntries.filter((m) => 
          m.page && m.page.toLowerCase().trim() === 'coffee'
        );
        console.log('Coffee page - Filtered entries from all:', entries);
      }
      
      // Filter for active entries on client side
      const activeEntries = entries.filter((m) => m.isActive !== false);
      
      console.log('Coffee page - All entries:', entries);
      console.log('Coffee page - Active entries:', activeEntries);
      console.log('Coffee page - Looking for section: coffee_hero_background');
      
      // Try to find exact match first
      let background = activeEntries.find((m) => 
        m.section && m.section.trim() === 'coffee_hero_background'
      );
      
      // If not found, try any active entry for coffee page
      if (!background && activeEntries.length > 0) {
        background = activeEntries[0];
        console.log('Coffee page - Using first available active entry:', background);
      }
      
      console.log('Coffee page - Selected background:', background);
      console.log('Coffee page - Background URL:', background?.url);
      
      if (background && background.url) {
        setBackgroundMedia(background);
      } else {
        console.warn('Coffee page - No valid background found.');
        console.warn('Coffee page - All entries from API:', entries);
        setBackgroundMedia(null);
      }
    } catch (error) {
      console.error('Error fetching coffee background:', error);
      setBackgroundMedia(null);
    }
  };

  const fetchCoffees = async () => {
    try {
      const response = await api.get('/coffee', {
        params: { _t: Date.now() }, // Cache busting
      });
      setCoffees(response.data);
    } catch (error) {
      console.error('Error fetching coffees:', error);
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = {
    'Mild': 'bg-green-500/20 text-green-400',
    'Medium': 'bg-yellow-500/20 text-yellow-400',
    'Strong': 'bg-orange-500/20 text-orange-400',
    'Extra Strong': 'bg-red-500/20 text-red-400',
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-coffee-amber text-xl">Loading coffee menu...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Media */}
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
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-coffee-darkest/90 via-coffee-darker/75 to-coffee-dark/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/5 via-transparent to-coffee-gold/5 z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center relative z-20"
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-coffee-amber mb-6">
            Coffee and More
          </h1>
          <p className="text-xl text-coffee-light">
            Curated selection of bold Robusta coffee brews
          </p>
        </motion.div>
      </section>

      {/* AI Coffee Discovery */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <CoffeeDiscovery />
        </div>
      </section>

      {/* Coffee Menu Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-heading font-bold text-coffee-amber mb-4 text-center">
            Explore Our Selection
          </h2>
          <p className="text-coffee-light text-center">
            Each brew is carefully crafted to showcase Robusta's bold character
          </p>
        </div>

        {coffees.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-coffee-light text-lg mb-4">No coffee items available yet.</p>
            <p className="text-coffee-light">Check back soon for our curated Robusta selection!</p>
          </div>
        ) : (() => {
          // Group coffees by category
          const groupedCoffees = coffees.reduce((acc, coffee) => {
            const category = coffee.category || 'Other';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(coffee);
            return acc;
          }, {});

          // Sort categories: Coffee first, then alphabetically
          const sortedCategories = Object.keys(groupedCoffees).sort((a, b) => {
            if (a === 'Coffee') return -1;
            if (b === 'Coffee') return 1;
            return a.localeCompare(b);
          });

          return (
            <div className="space-y-16">
              {sortedCategories.map((category, catIdx) => (
                <div key={category}>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: catIdx * 0.1 }}
                    className="text-3xl md:text-4xl font-heading font-bold text-coffee-amber mb-8 text-center"
                  >
                    {category}
                  </motion.h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupedCoffees[category].map((coffee, idx) => {
                      const isFlipped = flippedCards.has(coffee._id);
                      return (
                      <motion.div
                        key={coffee._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (catIdx * 0.1) + (idx * 0.1) }}
                        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
                        style={{ minHeight: '400px', height: '400px' }}
                        onTouchStart={(e) => {
                          // Prevent default to avoid double-tap zoom on mobile
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          // Toggle flip on mobile/tablet (screens < 768px)
                          if (window.innerWidth < 768 || 'ontouchstart' in window) {
                            e.stopPropagation();
                            setFlippedCards(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(coffee._id)) {
                                newSet.delete(coffee._id);
                              } else {
                                newSet.add(coffee._id);
                              }
                              return newSet;
                            });
                          }
                        }}
                      >
                        <div className="flip-card-inner">
                          {/* Front Side - Photo, Name, Strength, Price */}
                          <div className="flip-card-front">
                            {(coffee.image || coffee.cloudinary_url) ? (
                              <div className="w-full h-48 bg-coffee-brown/40 overflow-hidden rounded-lg mb-4">
                                <img
                                  src={`${coffee.cloudinary_url || coffee.image}?v=${coffee.updatedAt || Date.now()}`}
                                  alt={coffee.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-48 bg-coffee-brown/40 rounded-lg mb-4 flex items-center justify-center">
                                <span className="text-6xl">☕</span>
                              </div>
                            )}
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-heading font-bold text-coffee-amber text-center flex-1">
                                  {coffee.name}
                                </h3>
                                {coffee.isBestseller && (
                                  <span className="bg-coffee-amber text-coffee-darker text-xs font-semibold px-2 py-1 rounded ml-2">
                                    ⭐
                                  </span>
                                )}
                              </div>
                              {coffee.category === 'Coffee' && coffee.strength && (
                                <div className="flex justify-center mb-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${strengthColors[coffee.strength] || strengthColors['Medium']}`}>
                                    {coffee.strength}
                                  </span>
                                </div>
                              )}
                              <div className="mt-auto">
                                <p className="text-coffee-amber font-bold text-xl">₹{coffee.price?.toFixed(2) || '0.00'}</p>
                              </div>
                            </div>
                            <div className="mt-auto text-xs text-coffee-amber/70 md:hidden">
                              Tap to see description →
                            </div>
                          </div>
                          
                          {/* Back Side - Description */}
                          <div className="flip-card-back">
                            <div className="w-full">
                              <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">
                                {coffee.name}
                              </h3>
                              <p className="text-sm text-coffee-light leading-relaxed text-left">
                                {coffee.description}
                              </p>
                              {coffee.flavorNotes && coffee.flavorNotes.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs text-coffee-amber/80 mb-2 font-semibold">Flavor Notes:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {coffee.flavorNotes.map((note, noteIdx) => (
                                      <span
                                        key={noteIdx}
                                        className="text-xs bg-coffee-brown/40 text-coffee-cream px-2 py-1 rounded"
                                      >
                                        {note}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Coffee Detail Modal */}
      {selectedCoffee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCoffee(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-3xl font-heading font-bold text-coffee-amber">
                {selectedCoffee.name}
              </h2>
              <button
                onClick={() => setSelectedCoffee(null)}
                className="text-coffee-light hover:text-coffee-amber"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {(selectedCoffee.image || selectedCoffee.cloudinary_url) && (
              <div className="mb-6 rounded-lg overflow-hidden bg-coffee-brown/30">
                <img
                  src={`${selectedCoffee.cloudinary_url || selectedCoffee.image}?v=${selectedCoffee.updatedAt || Date.now()}`}
                  alt={selectedCoffee.name}
                  className="w-full max-h-64 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className="text-coffee-light text-lg mb-6 leading-relaxed">
              {selectedCoffee.description}
            </p>
            <div className="mb-6">
              <p className="text-coffee-amber font-bold text-2xl">₹{selectedCoffee.price?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {selectedCoffee.category === 'Coffee' && selectedCoffee.strength && (
                <div>
                  <h3 className="text-coffee-amber font-semibold mb-2">Strength</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${strengthColors[selectedCoffee.strength] || strengthColors['Medium']}`}>
                    {selectedCoffee.strength}
                  </span>
                </div>
              )}
              {selectedCoffee.flavorNotes && selectedCoffee.flavorNotes.length > 0 && (
                <div>
                  <h3 className="text-coffee-amber font-semibold mb-2">Flavor Notes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoffee.flavorNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="text-sm bg-coffee-brown/40 text-coffee-cream px-3 py-1 rounded"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      <Chatbot />
    </div>
  );
};

export default CoffeeMenu;

