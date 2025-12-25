import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';

const ArtGallery = () => {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArt, setSelectedArt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [backgroundMedia, setBackgroundMedia] = useState(null);

  useEffect(() => {
    fetchArts();
  }, [filter]);

  useEffect(() => {
    fetchBackground();
  }, []);

  const fetchBackground = async () => {
    try {
      // Try fetching with exact page name
      let response = await api.get('/site-media', {
        params: { page: 'art', _t: Date.now() },
      });
      let entries = response.data || [];
      
      // If no results, try fetching all and filtering client-side
      if (entries.length === 0) {
        console.log('Art Gallery page - No results with page filter, trying all entries...');
        response = await api.get('/site-media', {
          params: { _t: Date.now() },
        });
        const allEntries = response.data || [];
        // Filter for art page entries (case-insensitive)
        entries = allEntries.filter((m) => 
          m.page && m.page.toLowerCase().trim() === 'art'
        );
        console.log('Art Gallery page - Filtered entries from all:', entries);
      }
      
      // Filter for active entries on client side
      const activeEntries = entries.filter((m) => m.isActive !== false);
      
      console.log('Art Gallery page - All entries:', entries);
      console.log('Art Gallery page - Active entries:', activeEntries);
      console.log('Art Gallery page - Looking for section: art_hero_background');
      
      // Try to find exact match first
      let background = activeEntries.find((m) => 
        m.section && m.section.trim() === 'art_hero_background'
      );
      
      // If not found, try any active entry for art page
      if (!background && activeEntries.length > 0) {
        background = activeEntries[0];
        console.log('Art Gallery page - Using first available active entry:', background);
      }
      
      console.log('Art Gallery page - Selected background:', background);
      console.log('Art Gallery page - Background URL:', background?.url);
      
      if (background && background.url) {
        setBackgroundMedia(background);
      } else {
        console.warn('Art Gallery page - No valid background found.');
        console.warn('Art Gallery page - All entries from API:', entries);
        console.warn('Art Gallery page - Check if page name in DB matches "art" (lowercase)');
        setBackgroundMedia(null);
      }
    } catch (error) {
      console.error('Error fetching art background:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      setBackgroundMedia(null);
    }
  };

  const fetchArts = async () => {
    try {
      const params = filter !== 'all' ? { availability: filter } : {};
      params._t = Date.now(); // Cache busting
      const response = await api.get('/art', { params });
      setArts(response.data);
    } catch (error) {
      console.error('Error fetching arts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-coffee-amber text-xl">Loading art gallery...</div>
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
            Art Gallery
          </h1>
          <p className="text-xl text-coffee-light">
            Fine art showcased in our café space
          </p>
        </motion.div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 bg-coffee-brown/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-coffee-amber text-coffee-darker'
                  : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
              }`}
            >
              All Art
            </button>
            <button
              onClick={() => setFilter('Available')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'Available'
                  ? 'bg-coffee-amber text-coffee-darker'
                  : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilter('Sold')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'Sold'
                  ? 'bg-coffee-amber text-coffee-darker'
                  : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
              }`}
            >
              Sold
            </button>
          </div>
        </div>
      </section>

      {/* Art Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        {arts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-coffee-light text-lg mb-4">No art pieces available yet.</p>
            <p className="text-coffee-light">Check back soon for new artwork!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {arts.map((art, idx) => (
              <motion.div
                key={art._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-coffee-brown/20 rounded-lg overflow-hidden hover:bg-coffee-brown/30 transition-colors cursor-pointer"
                onClick={() => setSelectedArt(art)}
              >
                <div className="aspect-square bg-coffee-brown/40 flex items-center justify-center">
                  {art.image ? (
                    <img
                      src={`${art.image}?v=${art.updatedAt || Date.now()}`}
                      alt={art.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-6xl">🎨</span>';
                      }}
                    />
                  ) : (
                    <span className="text-6xl">🎨</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold text-coffee-amber mb-2">
                    {art.title}
                  </h3>
                  <p className="text-coffee-light mb-3">by {art.artistName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-coffee-amber">
                      ₹{art.price}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        art.availability === 'Available'
                          ? 'bg-green-500/20 text-green-400'
                          : art.availability === 'Sold'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {art.availability}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Art Detail Modal */}
      {selectedArt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArt(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-8 flex-1 min-h-0 relative">
              {/* Fixed Image Container */}
              <div className="sticky top-1/2 -translate-y-1/2 self-center aspect-square bg-coffee-brown/40 rounded-lg flex items-center justify-center flex-shrink-0 h-fit">
                {selectedArt.image ? (
                  <img
                    src={`${selectedArt.image}?v=${selectedArt.updatedAt || Date.now()}`}
                    alt={selectedArt.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-8xl">🎨</span>
                )}
              </div>
              {/* Scrollable Content Container */}
              <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-coffee-brown scrollbar-track-coffee-darker h-full">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-3xl font-heading font-bold text-coffee-amber">
                    {selectedArt.title}
                  </h2>
                  <button
                    onClick={() => setSelectedArt(null)}
                    className="text-coffee-light hover:text-coffee-amber"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-coffee-light text-lg mb-4">by {selectedArt.artistName}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-coffee-amber">₹{selectedArt.price}</span>
                  <span
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedArt.availability === 'Available'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedArt.availability === 'Sold'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {selectedArt.availability}
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-coffee-amber font-semibold mb-2">Description</h3>
                  <p className="text-coffee-light leading-relaxed">{selectedArt.description}</p>
                </div>
                {selectedArt.artistStory && (
                  <div className="mb-6">
                    <h3 className="text-coffee-amber font-semibold mb-2">Artist Story</h3>
                    <p className="text-coffee-light leading-relaxed">{selectedArt.artistStory}</p>
                  </div>
                )}
                {selectedArt.dimensions && (
                  <div className="mb-6">
                    <h3 className="text-coffee-amber font-semibold mb-2">Dimensions</h3>
                    <p className="text-coffee-light">{selectedArt.dimensions}</p>
                  </div>
                )}
                {selectedArt.availability === 'Available' && (
                  <button className="w-full bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors">
                    Contact to Purchase
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Chatbot />
    </div>
  );
};

export default ArtGallery;

