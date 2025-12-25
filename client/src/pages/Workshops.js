import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import OTPModal from '../components/OTPModal';
import VideoPlayer from '../components/VideoPlayer';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [backgroundMedia, setBackgroundMedia] = useState(null);

  useEffect(() => {
    fetchWorkshops();
    fetchBackground();
  }, []);

  const fetchBackground = async () => {
    try {
      // Try fetching with exact page name
      let response = await api.get('/site-media', {
        params: { page: 'workshops', _t: Date.now() },
      });
      let entries = response.data || [];
      
      // If no results, try fetching all and filtering client-side
      if (entries.length === 0) {
        console.log('Workshops page - No results with page filter, trying all entries...');
        response = await api.get('/site-media', {
          params: { _t: Date.now() },
        });
        const allEntries = response.data || [];
        // Filter for workshops page entries (case-insensitive)
        entries = allEntries.filter((m) => 
          m.page && m.page.toLowerCase().trim() === 'workshops'
        );
        console.log('Workshops page - Filtered entries from all:', entries);
      }
      
      // Filter for active entries on client side
      const activeEntries = entries.filter((m) => m.isActive !== false);
      
      console.log('Workshops page - All entries:', entries);
      console.log('Workshops page - Active entries:', activeEntries);
      console.log('Workshops page - Looking for section: workshops_hero_background');
      
      // Try to find exact match first
      let background = activeEntries.find((m) => 
        m.section && m.section.trim() === 'workshops_hero_background'
      );
      
      // If not found, try any active entry for workshops page
      if (!background && activeEntries.length > 0) {
        background = activeEntries[0];
        console.log('Workshops page - Using first available active entry:', background);
      }
      
      console.log('Workshops page - Selected background:', background);
      console.log('Workshops page - Background URL:', background?.url);
      
      if (background && background.url) {
        setBackgroundMedia(background);
      } else {
        console.warn('Workshops page - No valid background found.');
        console.warn('Workshops page - All entries from API:', entries);
        setBackgroundMedia(null);
      }
    } catch (error) {
      console.error('Error fetching workshops background:', error);
      setBackgroundMedia(null);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const response = await api.get('/workshops', { params: { active: true } });
      setWorkshops(response.data);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Store registration data and send OTP
    const registrationPayload = {
      ...registrationData,
      workshopId: selectedWorkshop._id
    };
    
    setPendingRegistration(registrationPayload);
    
    try {
      await api.post('/email/workshop/otp', {
        email: registrationData.email,
        registrationData: registrationPayload
      });
      setShowOTPModal(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      alert(errorMessage);
      // If it's a duplicate registration error, reset the form
      if (errorMessage.includes('already registered')) {
        setShowRegistration(false);
        setRegistrationData({ name: '', email: '', phone: '', message: '' });
        setPendingRegistration(null);
      }
    }
  };

  const handleOTPVerify = async (otp, resend = false) => {
    if (resend) {
      // Resend OTP
      try {
        await api.post('/email/workshop/otp', {
          email: pendingRegistration.email,
          registrationData: pendingRegistration
        });
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to resend OTP');
      }
      return;
    }

    // Verify OTP
    try {
      const response = await api.post('/email/workshop/verify', {
        email: pendingRegistration.email,
        otp
      });

      setRegistrationSuccess(true);
      setRegistrationData({ name: '', email: '', phone: '', message: '' });
      setPendingRegistration(null);
      setShowOTPModal(false);
      fetchWorkshops();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      // If it's a duplicate registration error, close modals and reset
      if (errorMessage.includes('already registered')) {
        setShowOTPModal(false);
        setShowRegistration(false);
        setRegistrationData({ name: '', email: '', phone: '', message: '' });
        setPendingRegistration(null);
      }
      throw new Error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-coffee-amber text-xl">Loading workshops...</div>
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
            Workshops & Experiences
          </h1>
          <p className="text-xl text-coffee-light">
            Join our community sessions and learn from experts
          </p>
        </motion.div>
      </section>

      {/* Workshops Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        {workshops.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-coffee-light text-lg mb-4">No workshops scheduled at the moment.</p>
            <p className="text-coffee-light">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {workshops.map((workshop, idx) => {
              const isFull = workshop.bookedSeats >= workshop.maxSeats;
              const availableSeats = workshop.maxSeats - workshop.bookedSeats;
              const seatPercentage = (workshop.bookedSeats / workshop.maxSeats) * 100;

              return (
                <motion.div
                  key={workshop._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-gradient-to-br from-coffee-brown/30 via-coffee-brown/20 to-coffee-dark/20 rounded-2xl p-6 border-2 border-coffee-brown/30 hover:border-coffee-amber/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-coffee-amber/10 hover:-translate-y-1"
                >
                  {/* Header with Type Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-coffee-amber/30 to-coffee-gold/30 text-coffee-amber px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-coffee-amber/30">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {workshop.type}
                    </span>
                    {isFull && (
                      <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-500/30">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Full
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-coffee-amber mb-3 leading-tight group-hover:text-coffee-gold transition-colors">
                    {workshop.title}
                  </h3>

                  {/* Description */}
                  <p className="text-coffee-light/90 mb-5 line-clamp-3 text-sm leading-relaxed">
                    {workshop.description}
                  </p>

                  {/* Details Grid */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coffee-amber/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-coffee-light font-medium">{formatDate(workshop.date)}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coffee-amber/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-coffee-light font-medium">{workshop.time} <span className="text-coffee-light/70">({workshop.duration})</span></span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coffee-amber/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-coffee-light font-medium">{workshop.instructor || 'TBA'}</span>
                    </div>

                    {/* Seat Availability with Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coffee-amber/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span className="text-coffee-light font-medium">
                            <span className={isFull ? 'text-red-400' : 'text-coffee-amber'}>{availableSeats}</span> of {workshop.maxSeats} seats {isFull ? 'booked' : 'available'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-coffee-brown/40 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${seatPercentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: idx * 0.1 + 0.3 }}
                          className={`h-full rounded-full ${
                            isFull 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : seatPercentage > 75 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                              : 'bg-gradient-to-r from-coffee-amber to-coffee-gold'
                          }`}
                        />
                      </div>
                    </div>

                    {workshop.price > 0 && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coffee-amber/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-coffee-amber font-bold text-lg">₹{workshop.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Register Button */}
                  <button
                    onClick={() => {
                      setSelectedWorkshop(workshop);
                      setShowRegistration(true);
                      setRegistrationSuccess(false);
                    }}
                    disabled={isFull}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                      isFull
                        ? 'bg-coffee-brown/40 text-coffee-light/60 cursor-not-allowed border-2 border-coffee-brown/40'
                        : 'bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker hover:from-coffee-gold hover:to-coffee-amber shadow-lg hover:shadow-xl hover:shadow-coffee-amber/30 hover:scale-[1.02] active:scale-[0.98] border-2 border-coffee-amber/30'
                    }`}
                  >
                    {isFull ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Fully Booked
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Register Now
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Registration Modal */}
      {showRegistration && selectedWorkshop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowRegistration(false);
            setRegistrationSuccess(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {registrationSuccess ? (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
                  Registration Successful!
                </h2>
                <p className="text-coffee-light mb-6">
                  We've received your registration. You'll receive a confirmation email shortly.
                </p>
                <button
                  onClick={() => {
                    setShowRegistration(false);
                    setRegistrationSuccess(false);
                    setSelectedWorkshop(null);
                  }}
                  className="bg-coffee-amber text-coffee-darker px-6 py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
                  Register for {selectedWorkshop.title}
                </h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-coffee-amber font-semibold mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationData.name}
                      onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                      className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-coffee-amber font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                      className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-coffee-amber font-semibold mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                      className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-coffee-amber font-semibold mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={registrationData.message}
                      onChange={(e) => setRegistrationData({ ...registrationData, message: e.target.value })}
                      rows="3"
                      className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegistration(false);
                        setRegistrationSuccess(false);
                      }}
                      className="flex-1 bg-coffee-brown/40 text-coffee-cream py-3 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setPendingRegistration(null);
        }}
        email={pendingRegistration?.email || ''}
        onVerify={handleOTPVerify}
        type="workshop"
      />

      <Chatbot />
    </div>
  );
};

export default Workshops;

