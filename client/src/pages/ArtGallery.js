import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';
import OTPModal from '../components/OTPModal';

const ArtGallery = () => {
  const navigate = useNavigate();
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArt, setSelectedArt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [backgroundMedia, setBackgroundMedia] = useState(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryFormData, setEnquiryFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    enquiryType: 'Information'
  });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingEnquiry, setPendingEnquiry] = useState(null);

  const getStatusBadge = (art) => {
    const status = art.status || art.availability?.toLowerCase() || 'available';
    const statusMap = {
      'available': { text: 'Available', class: 'bg-green-500/20 text-green-400' },
      'reserved': { text: 'Reserved', class: 'bg-yellow-500/20 text-yellow-400' },
      'sold': { text: 'Sold', class: 'bg-red-500/20 text-red-400' },
      'in_cafe': { text: 'In Café', class: 'bg-blue-500/20 text-blue-400' }
    };
    return statusMap[status] || statusMap['available'];
  };

  const handleBuyNow = (art) => {
    navigate(`/art-checkout/${art._id}`);
  };

  const fetchArts = useCallback(async () => {
    setLoading(true);
    try {
      // When filter is 'all', don't send availability param (backend will exclude sold)
      // When filter is 'Sold' or 'Available', send the filter
      const params = filter !== 'all' ? { availability: filter } : {};
      params._t = Date.now(); // Cache busting
      const response = await api.get('/art', { params });
      setArts(response.data);
    } catch (error) {
      console.error('Error fetching arts:', error);
      setArts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArts();
  }, [fetchArts]);

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
          <div className="flex flex-wrap gap-4 justify-center items-center">
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
            <button
              onClick={() => navigate('/my-art-orders')}
              className="px-6 py-2 rounded-lg font-semibold bg-coffee-amber/80 text-coffee-darker hover:bg-coffee-amber transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Orders
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-coffee-amber">
                      ₹{art.price}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(art).class}`}
                    >
                      {getStatusBadge(art).text}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {(art.status === 'available' || (!art.status && art.availability === 'Available')) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(art);
                        }}
                        className="flex-1 bg-coffee-amber text-coffee-darker py-2 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
                      >
                        Buy Now
                      </button>
                    ) : art.status === 'in_cafe' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info('This artwork is available for purchase at our café. Please visit us to buy!');
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Buy at Café
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-600 text-gray-400 py-2 rounded-lg font-semibold cursor-not-allowed"
                      >
                        {art.status === 'sold' ? 'Sold' : 'Reserved'}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArt(art);
                        setEnquiryFormData({
                          name: '',
                          email: '',
                          phone: '',
                          message: '',
                          enquiryType: 'Information'
                        });
                        setShowEnquiryForm(true);
                      }}
                      className="flex-1 bg-coffee-brown/40 text-coffee-cream py-2 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
                    >
                      Enquire
                    </button>
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
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedArt).class}`}
                  >
                    {getStatusBadge(selectedArt).text}
                  </span>
                  {selectedArt.exhibitedAtRabuste && (
                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-coffee-amber/20 text-coffee-amber">
                      Exhibited at Rabuste Coffee
                    </span>
                  )}
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
                <div className="flex gap-3">
                  {(selectedArt.status === 'available' || (!selectedArt.status && selectedArt.availability === 'Available')) ? (
                    <button 
                      onClick={() => handleBuyNow(selectedArt)}
                      className="flex-1 bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
                    >
                      Buy Now
                    </button>
                  ) : selectedArt.status === 'in_cafe' ? (
                    <button 
                      onClick={() => toast.info('This artwork is available for purchase at our café. Please visit us to buy!')}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Buy at Café
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-600 text-gray-400 py-3 rounded-lg font-semibold cursor-not-allowed"
                    >
                      {selectedArt.status === 'sold' ? 'Sold' : 'Reserved'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setEnquiryFormData({
                        name: '',
                        email: '',
                        phone: '',
                        message: '',
                        enquiryType: 'Information'
                      });
                      setShowEnquiryForm(true);
                    }}
                    className="flex-1 bg-coffee-brown/40 text-coffee-cream py-3 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
                  >
                    Enquire
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enquiry Form Modal */}
      {showEnquiryForm && selectedArt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEnquiryForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-3xl font-heading font-bold text-coffee-amber">
                Art Enquiry
              </h2>
              <button
                onClick={() => setShowEnquiryForm(false)}
                className="text-coffee-light hover:text-coffee-amber"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-coffee-brown/20 rounded-lg">
              <h3 className="text-xl font-heading font-bold text-coffee-amber mb-2">
                {selectedArt.title}
              </h3>
              <p className="text-coffee-light">by {selectedArt.artistName}</p>
              <p className="text-coffee-amber font-semibold mt-2">₹{selectedArt.price}</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setEnquiryLoading(true);

              try {
                await api.post('/email/art/otp', {
                  email: enquiryFormData.email,
                  enquiryData: {
                    ...enquiryFormData,
                    artId: selectedArt._id
                  }
                });
                
                setPendingEnquiry(enquiryFormData);
                setShowOTPModal(true);
                setShowEnquiryForm(false);
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
                console.error('Art enquiry error:', error);
              } finally {
                setEnquiryLoading(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={enquiryFormData.name}
                  onChange={(e) => setEnquiryFormData({ ...enquiryFormData, name: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={enquiryFormData.email}
                  onChange={(e) => setEnquiryFormData({ ...enquiryFormData, email: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={enquiryFormData.phone}
                  onChange={(e) => setEnquiryFormData({ ...enquiryFormData, phone: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Enquiry Type *
                </label>
                <select
                  required
                  value={enquiryFormData.enquiryType}
                  onChange={(e) => setEnquiryFormData({ ...enquiryFormData, enquiryType: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                >
                  <option value="Information">Get More Information</option>
                  <option value="Purchase">Purchase Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Message
                </label>
                <textarea
                  value={enquiryFormData.message}
                  onChange={(e) => setEnquiryFormData({ ...enquiryFormData, message: e.target.value })}
                  rows="4"
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="Tell us more about your enquiry..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={enquiryLoading}
                  className="flex-1 bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50"
                >
                  {enquiryLoading ? 'Sending...' : 'Submit Enquiry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEnquiryForm(false)}
                  className="flex-1 bg-coffee-brown/40 text-coffee-cream py-3 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setPendingEnquiry(null);
        }}
        email={pendingEnquiry?.email || ''}
        type="art"
        onVerify={async (otp, resend = false) => {
          if (resend) {
            try {
              await api.post('/email/art/otp', {
                email: pendingEnquiry.email,
                enquiryData: {
                  ...pendingEnquiry,
                  artId: selectedArt._id
                }
              });
            } catch (error) {
              throw new Error(error.response?.data?.message || 'Failed to resend OTP');
            }
            return;
          }

          try {
            await api.post('/email/art/verify', {
              email: pendingEnquiry.email,
              otp
            });

            toast.success('Enquiry submitted successfully! We will get back to you soon.');
            setPendingEnquiry(null);
            setShowOTPModal(false);
            setShowEnquiryForm(false);
            setEnquiryFormData({
              name: '',
              email: '',
              phone: '',
              message: '',
              enquiryType: 'Information'
            });
          } catch (error) {
            throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
          }
        }}
      />

      {/* Partner with Us Section - Moved to bottom */}
      <section className="py-12 px-4 bg-coffee-brown/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold text-coffee-amber mb-4">
            Selling Your Art?
          </h2>
          <p className="text-coffee-light mb-6">
            Partner with Rabuste Coffee and showcase your artwork in our café space
          </p>
          <button
            onClick={() => navigate('/artist-submission')}
            className="bg-coffee-amber text-coffee-darker px-8 py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
          >
            Partner with Us
          </button>
        </div>
      </section>

      <Chatbot />
    </div>
  );
};

export default ArtGallery;

