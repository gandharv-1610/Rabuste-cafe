import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';

const CoffeeCategory = () => {
  const [coffees, setCoffees] = useState([]);
  const [filteredCoffees, setFilteredCoffees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState('All'); // All, Hot, Cold
  const [milkFilter, setMilkFilter] = useState('All'); // All, Milk, Non-Milk
  const [flippedCards, setFlippedCards] = useState(new Set());

  useEffect(() => {
    fetchCoffees();
  }, []);

  useEffect(() => {
    filterCoffees();
  }, [coffees, subcategoryFilter, milkFilter]);

  const fetchCoffees = async () => {
    try {
      const response = await api.get('/coffee', {
        params: { category: 'Coffee', _t: Date.now() },
      });
      setCoffees(response.data || []);
    } catch (error) {
      console.error('Error fetching coffees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCoffees = () => {
    let filtered = [...coffees];

    if (subcategoryFilter !== 'All') {
      filtered = filtered.filter(coffee => coffee.subcategory === subcategoryFilter);
    }

    if (milkFilter !== 'All') {
      filtered = filtered.filter(coffee => coffee.milkType === milkFilter);
    }

    setFilteredCoffees(filtered);
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
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-6">
            Coffee Collection
          </h1>
          <p className="text-coffee-light text-lg">
            Explore our bold Robusta coffee selection
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 bg-coffee-brown/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row flex-wrap gap-6 justify-center items-center">
            {/* Temperature Filter */}
            <div className="flex flex-col items-center gap-3">
              <label className="text-coffee-amber font-semibold text-sm uppercase tracking-wide">Temperature</label>
              <div className="flex gap-2 bg-coffee-darker/50 p-1.5 rounded-full border border-coffee-brown/30">
                {['All', 'Hot', 'Cold'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSubcategoryFilter(option)}
                    className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                      subcategoryFilter === option
                        ? 'bg-coffee-amber text-coffee-darker shadow-lg shadow-coffee-amber/30 scale-105'
                        : 'text-coffee-cream hover:bg-coffee-brown/40 hover:text-coffee-amber'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Milk Type Filter */}
            <div className="flex flex-col items-center gap-3">
              <label className="text-coffee-amber font-semibold text-sm uppercase tracking-wide">Milk Type</label>
              <div className="flex gap-2 bg-coffee-darker/50 p-1.5 rounded-full border border-coffee-brown/30">
                {['All', 'Milk', 'Non-Milk'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setMilkFilter(option === 'Milk' ? 'Milk' : option === 'Non-Milk' ? 'Non-Milk' : 'All')}
                    className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                      milkFilter === option
                        ? 'bg-coffee-amber text-coffee-darker shadow-lg shadow-coffee-amber/30 scale-105'
                        : 'text-coffee-cream hover:bg-coffee-brown/40 hover:text-coffee-amber'
                    }`}
                  >
                    {option === 'Milk' ? 'With Milk' : option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coffee Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        {filteredCoffees.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-coffee-light text-lg mb-4">No coffee items found for the selected filters.</p>
            <button
              onClick={() => {
                setSubcategoryFilter('All');
                setMilkFilter('All');
              }}
              className="text-coffee-amber hover:text-coffee-gold underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCoffees.map((coffee, idx) => {
              const isFlipped = flippedCards.has(coffee._id);
              return (
                <motion.div
                  key={coffee._id}
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
                        if (newSet.has(coffee._id)) {
                          newSet.delete(coffee._id);
                        } else {
                          newSet.add(coffee._id);
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
                        <div className="flex justify-center gap-2 mb-2 flex-wrap">
                          {coffee.subcategory && (
                            <span className="px-2 py-1 rounded text-xs bg-coffee-brown/40 text-coffee-cream">
                              {coffee.subcategory}
                            </span>
                          )}
                          {coffee.milkType && (
                            <span className="px-2 py-1 rounded text-xs bg-coffee-brown/40 text-coffee-cream">
                              {coffee.milkType}
                            </span>
                          )}
                        </div>
                        {coffee.strength && (
                          <div className="flex justify-center mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${strengthColors[coffee.strength] || strengthColors['Medium']}`}>
                              {coffee.strength}
                            </span>
                          </div>
                        )}
                        <div className="mt-auto">
                          <div className="flex flex-col gap-1 items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-coffee-light">Blend:</span>
                              {(coffee.priceBlend && parseFloat(coffee.priceBlend) > 0) ? (
                                <p className="text-coffee-amber font-bold text-lg">₹{parseFloat(coffee.priceBlend).toFixed(2)}</p>
                              ) : (
                                <p className="text-coffee-light text-sm">N/A</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-coffee-light">Robusta Special:</span>
                              {(coffee.priceRobustaSpecial && parseFloat(coffee.priceRobustaSpecial) > 0) ? (
                                <p className="text-coffee-amber font-bold text-lg">₹{parseFloat(coffee.priceRobustaSpecial).toFixed(2)}</p>
                              ) : (
                                <p className="text-coffee-light text-sm">N/A</p>
                              )}
                            </div>
                          </div>
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
        )}
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
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-coffee-light font-semibold">Blend:</span>
                  {(selectedCoffee.priceBlend && parseFloat(selectedCoffee.priceBlend) > 0) ? (
                    <p className="text-coffee-amber font-bold text-2xl">₹{parseFloat(selectedCoffee.priceBlend).toFixed(2)}</p>
                  ) : (
                    <p className="text-coffee-light">N/A</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-coffee-light font-semibold">Robusta Special:</span>
                  {(selectedCoffee.priceRobustaSpecial && parseFloat(selectedCoffee.priceRobustaSpecial) > 0) ? (
                    <p className="text-coffee-amber font-bold text-2xl">₹{parseFloat(selectedCoffee.priceRobustaSpecial).toFixed(2)}</p>
                  ) : (
                    <p className="text-coffee-light">N/A</p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {selectedCoffee.strength && (
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

export default CoffeeCategory;

