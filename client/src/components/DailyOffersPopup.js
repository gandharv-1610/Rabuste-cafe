import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const DailyOffersPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && offers.length === 0) {
      fetchOffers();
    }
  }, [isOpen]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      // Endpoint to fetch active offers
      const response = await api.get('/billing/offers/active');
      setOffers(response.data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-8 z-40 bg-gradient-to-r from-coffee-amber to-coffee-gold p-3 rounded-full shadow-lg shadow-coffee-amber/20 group hover:scale-110 transition-transform duration-300"
        title="View Daily Offers"
      >
        <span className="sr-only">Daily Offers</span>
        <div className="relative">
          <svg className="w-6 h-6 text-coffee-darker transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      </motion.button>

      {/* Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-coffee-darkest/80 backdrop-blur-sm z-50"
            />

            {/* Modal Container Overlay - Flexbox for robust centering */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-coffee-dark rounded-2xl shadow-2xl border border-coffee-brown/50 overflow-hidden max-h-[85vh] flex flex-col pointer-events-auto"
              >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-coffee-darker to-coffee-dark border-b border-coffee-brown/30 flex items-center justify-between">
                  <h2 className="text-2xl font-heading font-bold text-coffee-amber flex items-center gap-2">
                    <span className="text-2xl">🎁</span> Daily Offers
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-coffee-light hover:text-coffee-amber hover:bg-coffee-brown/30 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-coffee-amber border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : offers.length > 0 ? (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <motion.div
                          key={offer._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-coffee-brown/20 rounded-xl p-4 border border-coffee-brown/30 hover:border-coffee-amber/50 transition-colors relative overflow-hidden group"
                        >
                          {/* Badge */}
                          {offer.badgeText && (
                            <div className="absolute top-0 right-0 bg-coffee-amber text-coffee-darker text-xs font-bold px-3 py-1 rounded-bl-lg">
                              {offer.badgeText}
                            </div>
                          )}

                          <h3 className="text-lg font-bold text-coffee-cream mb-1">{offer.title}</h3>
                          {offer.subtitle && (
                            <p className="text-coffee-light text-sm mb-3">{offer.subtitle}</p>
                          )}

                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl font-bold text-coffee-amber">
                              {offer.offerType === 'percentage'
                                ? `${offer.discountValue}% OFF`
                                : `₹${offer.discountValue} OFF`}
                            </div>
                            {offer.minOrderAmount > 0 && (
                              <div className="text-xs text-coffee-light bg-coffee-brown/40 px-2 py-1 rounded">
                                Min. Order: ₹{offer.minOrderAmount}
                              </div>
                            )}
                          </div>

                          {offer.description && (
                            <p className="text-sm text-coffee-light/80 mb-3">{offer.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-coffee-light/60 border-t border-coffee-brown/30 pt-3">
                            <div className="flex gap-2">
                              {offer.endDate && (
                                <span>Valid till: {formatDate(offer.endDate)}</span>
                              )}
                            </div>
                            <div>
                              {offer.code ? (
                                <span className="font-mono bg-coffee-darker px-2 py-1 rounded text-coffee-amber border border-coffee-amber/20 dashed">
                                  {offer.code}
                                </span>
                              ) : (
                                <span className="text-green-400">Auto-Applied</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-coffee-light">
                      <p className="text-lg mb-2">No active offers right now.</p>
                      <p className="text-sm opacity-70">Check back later for exciting deals!</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-coffee-darker/50 border-t border-coffee-brown/30 text-center">
                  <p className="text-xs text-coffee-light/50">Offers are automatically applied at checkout based on eligibility.</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyOffersPopup;
