import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { setCustomerSession } from '../utils/customerAuth';

const CustomerLoginModal = ({ isOpen, onClose, onSuccess, requireName = false, title = 'Login to Continue' }) => {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  // Validate mobile number
  const validateMobile = (mobile) => {
    const cleaned = mobile.replace(/[\s-]/g, '');
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  };

  // Check if customer exists when mobile is entered
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (mobile && mobile.trim().length >= 10 && validateMobile(mobile)) {
        try {
          const response = await api.get(`/customers/lookup/${mobile}`);
          if (response.data.exists && response.data.customer) {
            const customer = response.data.customer;
            setIsExistingCustomer(true);
            setName(customer.name || '');
            setEmail(customer.email || '');
          } else {
            setIsExistingCustomer(false);
            if (!requireName) {
              setName('');
            }
          }
        } catch (error) {
          setIsExistingCustomer(false);
        }
      } else {
        setIsExistingCustomer(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [mobile, requireName]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMobile('');
      setName('');
      setEmail('');
      setMobileError('');
      setNameError('');
      setIsExistingCustomer(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMobileError('');
    setNameError('');

    // Validate mobile
    if (!mobile || !mobile.trim()) {
      setMobileError('Mobile number is required');
      return;
    }

    if (!validateMobile(mobile)) {
      setMobileError('Please enter a valid Indian mobile number (10 digits)');
      return;
    }

    // Validate name if required or if new customer
    if ((requireName || !isExistingCustomer) && (!name || !name.trim())) {
      setNameError('Name is required');
      return;
    }

    if (name && name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      // Get or create customer
      const response = await api.post('/customers', {
        mobile: mobile.trim(),
        name: name.trim() || undefined,
        email: email.trim() || undefined
      });

      const customer = response.data.customer;
      
      // Save session
      setCustomerSession(customer);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(customer);
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to login. Please try again.';
      if (errorMessage.includes('name')) {
        setNameError(errorMessage);
      } else {
        setMobileError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-coffee-brown rounded-xl p-6 w-full max-w-md border border-coffee-amber/30 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-heading font-bold text-coffee-amber">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-coffee-light hover:text-coffee-amber transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-coffee-cream mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setMobileError('');
                }}
                className={`w-full bg-coffee-darker/50 border ${
                  mobileError ? 'border-red-500' : 'border-coffee-brown'
                } text-coffee-cream rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-coffee-amber`}
                maxLength={13}
                autoFocus
              />
              {mobileError && (
                <p className="text-red-400 text-sm mt-1">{mobileError}</p>
              )}
              {isExistingCustomer && mobile.length >= 10 && (
                <p className="text-green-400 text-sm mt-1">✓ Existing customer found</p>
              )}
            </div>

            {(requireName || !isExistingCustomer) && (
              <div>
                <label className="block text-sm font-semibold text-coffee-cream mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError('');
                  }}
                  className={`w-full bg-coffee-darker/50 border ${
                    nameError ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-coffee-amber`}
                />
                {nameError && (
                  <p className="text-red-400 text-sm mt-1">{nameError}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-coffee-cream mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-coffee-darker/50 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-coffee-amber"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-coffee-brown/60 text-coffee-cream rounded-lg font-semibold hover:bg-coffee-brown/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerLoginModal;

