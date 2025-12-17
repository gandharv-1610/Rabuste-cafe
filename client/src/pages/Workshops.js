import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import OTPModal from '../components/OTPModal';
import { generateGoogleCalendarUrl } from 'google-calendar-url';

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

  useEffect(() => {
    fetchWorkshops();
  }, []);

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
      alert(error.response?.data?.message || 'Failed to send OTP. Please try again.');
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
      throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
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
      <section className="py-20 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-coffee-amber mb-6">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop, idx) => {
              const isFull = workshop.bookedSeats >= workshop.maxSeats;
              const availableSeats = workshop.maxSeats - workshop.bookedSeats;

              return (
                <motion.div
                  key={workshop._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-coffee-brown/20 rounded-lg p-6 hover:bg-coffee-brown/30 transition-colors"
                >
                  <div className="mb-4">
                    <span className="inline-block bg-coffee-amber/30 text-coffee-amber px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {workshop.type}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-coffee-amber mb-3">
                    {workshop.title}
                  </h3>
                  <p className="text-coffee-light mb-4 line-clamp-3">
                    {workshop.description}
                  </p>
                  <div className="space-y-2 mb-4 text-sm text-coffee-light">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      {formatDate(workshop.date)}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🕐</span>
                      {workshop.time} ({workshop.duration})
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      {workshop.instructor || 'TBA'}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👥</span>
                      {availableSeats} of {workshop.maxSeats} seats available
                    </div>
                    {workshop.price > 0 && (
                      <div className="flex items-center">
                        <span className="mr-2">💰</span>
                        ${workshop.price}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWorkshop(workshop);
                      setShowRegistration(true);
                      setRegistrationSuccess(false);
                    }}
                    disabled={isFull}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      isFull
                        ? 'bg-coffee-brown/40 text-coffee-light cursor-not-allowed'
                        : 'bg-coffee-amber text-coffee-darker hover:bg-coffee-gold'
                    }`}
                  >
                    {isFull ? 'Fully Booked' : 'Register Now'}
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
                <h2 className="text-2xl font-display font-bold text-coffee-amber mb-4">
                  Registration Successful!
                </h2>
                <p className="text-coffee-light mb-6">
                  We've received your registration. You'll receive a confirmation email shortly.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href={generateGoogleCalendarUrl({
                      start: new Date(selectedWorkshop.date + ' ' + selectedWorkshop.time),
                      end: new Date(new Date(selectedWorkshop.date + ' ' + selectedWorkshop.time).getTime() + 2 * 60 * 60 * 1000),
                      title: selectedWorkshop.title,
                      details: selectedWorkshop.description,
                      location: 'Rabuste Coffee'
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    📅 Add to Google Calendar
                  </a>
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
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-display font-bold text-coffee-amber mb-4">
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

