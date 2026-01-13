import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import OTPModal from '../components/OTPModal';
import VideoPlayer from '../components/VideoPlayer';
import CoffeeLoader from '../components/CoffeeLoader';

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
  const [paymentMethod, setPaymentMethod] = useState(null); // 'ONLINE' or 'PAY_AT_ENTRY'
  const [processingPayment, setProcessingPayment] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const workshopPrice = selectedWorkshop.price || 0;
    
    // Store registration data and send OTP (for all types)
    const registrationPayload = {
      ...registrationData,
      workshopId: selectedWorkshop._id,
      paymentMethod: workshopPrice === 0 ? 'FREE' : paymentMethod || null,
      amount: workshopPrice
    };
    
    setPendingRegistration(registrationPayload);
    setSendingOTP(true);
    
    try {
      await api.post('/email/workshop/otp', {
        email: registrationData.email,
        registrationData: registrationPayload
      });
      setSendingOTP(false);
      setShowOTPModal(true);
    } catch (error) {
      setSendingOTP(false);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
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
      setSendingOTP(true);
      try {
        await api.post('/email/workshop/otp', {
          email: pendingRegistration.email,
          registrationData: pendingRegistration
        });
        setSendingOTP(false);
      } catch (error) {
        setSendingOTP(false);
        throw new Error(error.response?.data?.message || 'Failed to resend OTP');
      }
      return;
    }

    const workshopPrice = pendingRegistration.amount || 0;
    const paymentMethod = pendingRegistration.paymentMethod;

    // If free workshop or pay at entry, verify OTP and register directly
    if (workshopPrice === 0 || paymentMethod === 'PAY_AT_ENTRY') {
      try {
        await api.post('/email/workshop/verify', {
          email: pendingRegistration.email,
          otp
        });

        setRegistrationSuccess(true);
        setRegistrationData({ name: '', email: '', phone: '', message: '' });
        setPendingRegistration(null);
        setPaymentMethod(null);
        setShowOTPModal(false);
        setShowRegistration(false);
        setShowConfirmationPopup(true);
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
      return;
    }

    // If online payment, verify OTP first (without creating registration), then proceed to payment
    if (paymentMethod === 'ONLINE') {
      try {
        // Verify OTP only (don't create registration yet)
        await api.post('/email/workshop/verify-otp-only', {
          email: pendingRegistration.email,
          otp
        });

        // OTP verified, now proceed to payment (registration will be created after payment)
        setShowOTPModal(false);
        await handleOnlinePayment();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
        if (errorMessage.includes('already registered')) {
          setShowOTPModal(false);
          setShowRegistration(false);
          setRegistrationData({ name: '', email: '', phone: '', message: '' });
          setPendingRegistration(null);
        }
        throw new Error(errorMessage);
      }
    }
  };

  const handleOnlinePayment = async () => {
    setProcessingPayment(true);
    try {
      // Create a temporary registration first (similar to order creation)
      const tempRegistration = await api.post(`/workshops/${pendingRegistration.workshopId}/register`, {
        ...pendingRegistration,
        paymentMethod: 'ONLINE',
        createTempOnly: true // Flag to create temp registration
      });

      // Create Razorpay order using the same flow as orders
      const orderResponse = await api.post('/payment/create-order', {
        amount: pendingRegistration.amount,
        orderId: tempRegistration.data.registration._id, // Use registration ID as orderId
        customerName: pendingRegistration.name,
        customerEmail: pendingRegistration.email,
        isWorkshop: true
      });

      const options = {
        key: orderResponse.data.key,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Rabuste Coffee',
        description: `Workshop: ${selectedWorkshop.title}`,
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            // Verify payment using the same endpoint as orders
            await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: tempRegistration.data.registration._id,
              isWorkshop: true
            });

            setRegistrationSuccess(true);
            setRegistrationData({ name: '', email: '', phone: '', message: '' });
            setPendingRegistration(null);
            setPaymentMethod(null);
            setShowRegistration(false);
            setShowConfirmationPopup(true);
            fetchWorkshops();
            setProcessingPayment(false);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: pendingRegistration.name,
          email: pendingRegistration.email,
          contact: pendingRegistration.phone
        },
        theme: {
          color: '#FF6F00'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <CoffeeLoader size="lg" />
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
                  {/* Workshop Image or Video */}
                  {(workshop.cloudinary_url || workshop.image || workshop.video_url) && (
                    <div className="mb-4 rounded-xl overflow-hidden bg-coffee-brown/40 aspect-video">
                      {workshop.video_url ? (
                        <VideoPlayer
                          videoUrl={workshop.video_url}
                          autoplay={false}
                          controls={true}
                          className="w-full h-full"
                        />
                      ) : (
                        <img
                          src={`${workshop.cloudinary_url || workshop.image}?v=${workshop.updatedAt || Date.now()}`}
                          alt={workshop.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  
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

                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coffee-amber/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-coffee-amber font-bold text-lg">
                        {(workshop.price || 0) > 0 ? `₹${workshop.price}` : 'Free'}
                      </span>
                    </div>
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
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-6 md:p-8 max-w-md w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {registrationSuccess ? (
              <div className="text-center flex-shrink-0">
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
                <h2 className="text-xl md:text-2xl font-heading font-bold text-coffee-amber mb-4 flex-shrink-0">
                  Register for {selectedWorkshop.title}
                </h2>
                <form onSubmit={handleRegister} className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
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

                  {/* Payment Method Selection (only for paid workshops) */}
                  {(selectedWorkshop.price || 0) > 0 && (
                    <div>
                      <label className="block text-coffee-amber font-semibold mb-3">
                        Payment Method *
                      </label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('ONLINE')}
                          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all text-left ${
                            paymentMethod === 'ONLINE'
                              ? 'bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker shadow-lg border-2 border-coffee-amber'
                              : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60 border-2 border-coffee-brown/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">💳</span>
                            <div className="flex-1">
                              <div className="font-bold">Pay Online</div>
                              <div className="text-xs opacity-80">Secure payment via Razorpay</div>
                            </div>
                            {paymentMethod === 'ONLINE' && <span className="text-lg">✓</span>}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('PAY_AT_ENTRY')}
                          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all text-left ${
                            paymentMethod === 'PAY_AT_ENTRY'
                              ? 'bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker shadow-lg border-2 border-coffee-amber'
                              : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60 border-2 border-coffee-brown/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🏪</span>
                            <div className="flex-1">
                              <div className="font-bold">Pay at Entry</div>
                              <div className="text-xs opacity-80">Pay when you arrive at the workshop</div>
                            </div>
                            {paymentMethod === 'PAY_AT_ENTRY' && <span className="text-lg">✓</span>}
                          </div>
                        </button>
                      </div>
                      {paymentMethod === 'PAY_AT_ENTRY' && (
                        <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
                          <p className="text-yellow-200 text-sm font-semibold">
                            ⚠️ Important: Entry will be allowed only after payment at the counter.
                          </p>
                        </div>
                      )}
                      <div className="mt-3 p-3 bg-coffee-brown/30 rounded-lg border border-coffee-brown/50">
                        <div className="flex justify-between items-center">
                          <span className="text-coffee-light">Workshop Fee:</span>
                          <span className="text-coffee-amber font-bold text-lg">₹{(selectedWorkshop.price || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 flex-shrink-0 pt-2">
                    <button
                      type="submit"
                      disabled={processingPayment || ((selectedWorkshop.price || 0) > 0 && !paymentMethod)}
                      className="flex-1 bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingPayment ? 'Processing...' : (selectedWorkshop.price || 0) > 0 ? 'Continue' : 'Register'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegistration(false);
                        setRegistrationSuccess(false);
                        setPaymentMethod(null);
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

      {/* Sending OTP Popup */}
      {sendingOTP && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-sm w-full text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-coffee-amber border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-xl font-heading font-bold text-coffee-amber">
                Sending OTP...
              </h3>
              <p className="text-coffee-light text-sm">
                Please wait while we send the verification code to your email.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Registration Confirmation Popup */}
      {showConfirmationPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowConfirmationPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-coffee-darker border-2 border-coffee-amber rounded-lg p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 bg-coffee-amber/20 rounded-full flex items-center justify-center"
              >
                <svg className="w-12 h-12 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-heading font-bold text-coffee-amber">
                Registration Successful!
              </h3>
              <p className="text-coffee-light">
                Your workshop registration has been confirmed. A confirmation email has been sent to your registered email address.
              </p>
              {selectedWorkshop && (
                <div className="mt-2 p-4 bg-coffee-brown/30 rounded-lg border border-coffee-brown/50 w-full">
                  <p className="text-coffee-amber font-semibold mb-1">Workshop Details:</p>
                  <p className="text-coffee-light text-sm">{selectedWorkshop.title}</p>
                  <p className="text-coffee-light text-sm">{formatDate(selectedWorkshop.date)} at {selectedWorkshop.time}</p>
                </div>
              )}
              <button
                onClick={() => {
                  setShowConfirmationPopup(false);
                  setSelectedWorkshop(null);
                }}
                className="mt-4 bg-coffee-amber text-coffee-darker px-8 py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Chatbot />
    </div>
  );
};

export default Workshops;

