import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';

const SidesCategory = () => {
  const [sides, setSides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState(new Set());

  useEffect(() => {
    fetchSides();
  }, []);

  const fetchSides = async () => {
    try {
      const response = await api.get('/coffee', {
        params: { category: 'Sides', _t: Date.now() },
      });
      setSides(response.data || []);
    } catch (error) {
      console.error('Error fetching sides:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-coffee-amber text-xl">Loading sides...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-6">
            Sides
          </h1>
          <p className="text-coffee-light text-lg">
            Perfect accompaniments to your coffee
          </p>
        </div>
      </section>

      {/* Sides Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        {sides.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-coffee-light text-lg">No sides available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sides.map((side, idx) => {
              const isFlipped = flippedCards.has(side._id);
              return (
                <motion.div
                  key={side._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flip-card ${isFlipped ? 'flipped' : ''}`}
                  style={{ minHeight: '400px', height: '400px' }}
                  onTouchEnd={(e) => {
                    // Only handle touch on mobile devices
                    if (window.innerWidth < 768 || 'ontouchstart' in window) {
                      e.preventDefault();
                      e.stopPropagation();
                      setFlippedCards(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(side._id)) {
                          newSet.delete(side._id);
                        } else {
                          newSet.add(side._id);
                        }
                        return newSet;
                      });
                    }
                  }}
                  onClick={(e) => {
                    // Handle click on desktop (hover doesn't work on touch devices)
                    if (window.innerWidth >= 768 && !('ontouchstart' in window)) {
                      // Desktop hover handles flip, so we don't need click handler
                      return;
                    }
                    // For mobile, touchEnd handles it, but keep this as fallback
                    if (window.innerWidth < 768 || 'ontouchstart' in window) {
                      e.stopPropagation();
                    }
                  }}
                >
                  <div className="flip-card-inner">
                    {/* Front Side */}
                    <div className="flip-card-front">
                      {(side.image || side.cloudinary_url) ? (
                        <div className="w-full h-48 bg-coffee-brown/40 overflow-hidden rounded-lg mb-4">
                          <img
                            src={`${side.cloudinary_url || side.image}?v=${side.updatedAt || Date.now()}`}
                            alt={side.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-coffee-brown/40 rounded-lg mb-4 flex items-center justify-center">
                          <span className="text-6xl">🍰</span>
                        </div>
                      )}
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-heading font-bold text-coffee-amber text-center flex-1">
                            {side.name}
                          </h3>
                          {side.isBestseller && (
                            <span className="bg-coffee-amber text-coffee-darker text-xs font-semibold px-2 py-1 rounded ml-2">
                              ⭐
                            </span>
                          )}
                        </div>
                        <div className="mt-auto">
                          <p className="text-coffee-amber font-bold text-xl">₹{side.price?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                      <div className="mt-auto text-xs text-coffee-amber/70 md:hidden">
                        Tap to see description →
                      </div>
                    </div>
                    
                    {/* Back Side */}
                    <div className="flip-card-back">
                      <div className="w-full">
                        <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">
                          {side.name}
                        </h3>
                        <p className="text-sm text-coffee-light leading-relaxed text-left">
                          {side.description}
                        </p>
                        {side.flavorNotes && side.flavorNotes.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-coffee-amber/80 mb-2 font-semibold">Flavor Notes:</p>
                            <div className="flex flex-wrap gap-2">
                              {side.flavorNotes.map((note, noteIdx) => (
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
        )}
      </section>

      <Chatbot />
    </div>
  );
};

export default SidesCategory;

