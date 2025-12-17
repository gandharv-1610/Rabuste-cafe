import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import OTPModal from '../components/OTPModal';

const Franchise = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    investmentRange: '',
    experience: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingEnquiry, setPendingEnquiry] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send OTP instead of submitting directly
      await api.post('/email/franchise/otp', {
        email: formData.email,
        enquiryData: formData
      });
      
      setPendingEnquiry(formData);
      setShowOTPModal(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      console.error('Franchise enquiry error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp, resend = false) => {
    if (resend) {
      // Resend OTP
      try {
        await api.post('/email/franchise/otp', {
          email: pendingEnquiry.email,
          enquiryData: pendingEnquiry
        });
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to resend OTP');
      }
      return;
    }

    // Verify OTP and submit enquiry
    try {
      const response = await api.post('/email/franchise/verify', {
        email: pendingEnquiry.email,
        otp
      });

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        investmentRange: '',
        experience: '',
        message: '',
      });
      setPendingEnquiry(null);
      setShowOTPModal(false);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const benefits = [
    {
      icon: '🚀',
      title: 'Proven Concept',
      description: 'Join a scalable café model with a unique positioning in the specialty coffee market.',
    },
    {
      icon: '☕',
      title: 'Brand Value',
      description: 'Be part of a brand that celebrates bold Robusta coffee and premium experiences.',
    },
    {
      icon: '🎨',
      title: 'Multi-Faceted Business',
      description: 'Operate a café that combines coffee, art, workshops, and community engagement.',
    },
    {
      icon: '📈',
      title: 'Growth Potential',
      description: 'Tap into the growing specialty coffee market with a differentiated offering.',
    },
  ];

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
            Franchise Opportunity
          </h1>
          <p className="text-xl text-coffee-light">
            Bring the Rabuste Coffee experience to your community
          </p>
        </motion.div>
      </section>

      {/* Overview Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-display font-bold text-coffee-amber mb-6 text-center">
            Join the Rabuste Movement
          </h2>
          <div className="bg-coffee-brown/20 rounded-lg p-8 md:p-12">
            <p className="text-lg text-coffee-light mb-6 leading-relaxed">
              Rabuste Coffee offers a unique franchise opportunity for entrepreneurs who want to be part of the specialty coffee revolution. Our model combines bold Robusta coffee, art gallery experiences, community workshops, and technology-driven customer engagement.
            </p>
            <p className="text-lg text-coffee-light leading-relaxed">
              We're looking for partners who share our passion for quality, innovation, and community building. If you're ready to bring this bold concept to your market, we'd love to hear from you.
            </p>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-display font-bold text-coffee-amber mb-12 text-center">
            Why Franchise with Rabuste?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-coffee-brown/20 rounded-lg p-6"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-2xl font-display font-semibold text-coffee-amber mb-3">
                  {benefit.title}
                </h3>
                <p className="text-coffee-light leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-display font-bold text-coffee-amber mb-8 text-center">
            Requirements & Benefits
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-coffee-brown/20 rounded-lg p-6">
              <h3 className="text-2xl font-display font-semibold text-coffee-amber mb-4">
                What We Look For
              </h3>
              <ul className="space-y-3 text-coffee-light">
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Passion for coffee and hospitality
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Commitment to brand values and quality
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Business experience (preferred)
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Suitable location for café operation
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Financial capacity for initial investment
                </li>
              </ul>
            </div>
            <div className="bg-coffee-brown/20 rounded-lg p-6">
              <h3 className="text-2xl font-display font-semibold text-coffee-amber mb-4">
                What We Provide
              </h3>
              <ul className="space-y-3 text-coffee-light">
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Comprehensive training program
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Brand guidelines and marketing support
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Operations manual and systems
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Ongoing support and guidance
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-amber mr-2">•</span>
                  Access to supplier networks
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Enquiry Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-coffee-amber/20 to-coffee-gold/20 rounded-lg p-8 md:p-12"
        >
          <h2 className="text-4xl font-display font-bold text-coffee-amber mb-8 text-center">
            Get in Touch
          </h2>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-display font-bold text-coffee-amber mb-4">
                Thank You!
              </h3>
              <p className="text-coffee-light text-lg mb-6">
                We've received your franchise enquiry. Our team will contact you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-coffee-amber text-coffee-darker px-6 py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                  />
                </div>
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                  />
                </div>
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State/Country"
                    className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    Investment Range
                  </label>
                  <select
                    name="investmentRange"
                    value={formData.investmentRange}
                    onChange={handleChange}
                    className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                  >
                    <option value="">Select range</option>
                    <option value="Under $50K">Under $50K</option>
                    <option value="$50K - $100K">$50K - $100K</option>
                    <option value="$100K - $200K">$100K - $200K</option>
                    <option value="$200K - $500K">$200K - $500K</option>
                    <option value="Over $500K">Over $500K</option>
                  </select>
                </div>
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    Business Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Brief description"
                    className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                  />
                </div>
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about your interest in franchising with Rabuste Coffee..."
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coffee-amber text-coffee-darker py-4 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Submit Franchise Enquiry'}
              </button>
            </form>
          )}
        </motion.div>
      </section>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setPendingEnquiry(null);
        }}
        email={pendingEnquiry?.email || ''}
        onVerify={handleOTPVerify}
        type="franchise"
      />

      <Chatbot />
    </div>
  );
};

export default Franchise;

