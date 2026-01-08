import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import OTPModal from '../components/OTPModal';

const MyArtOrders = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [artOrders, setArtOrders] = useState([]);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Check if email is already verified on mount
  useEffect(() => {
    const verified = localStorage.getItem('art_orders_verified_email');
    const verifiedTime = localStorage.getItem('art_orders_verified_time');
    
    if (verified && verifiedTime) {
      // Check if verification is still valid (24 hours)
      const timeDiff = Date.now() - parseInt(verifiedTime);
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (timeDiff < hours24) {
        setEmail(verified);
        setVerifiedEmail(verified);
        setIsVerified(true);
        fetchArtOrdersDirect(verified);
      } else {
        // Expired, clear storage
        localStorage.removeItem('art_orders_verified_email');
        localStorage.removeItem('art_orders_verified_time');
      }
    }
  }, []);

  // Fetch art orders directly (after verification)
  const fetchArtOrdersDirect = async (emailAddress) => {
    setLoading(true);
    try {
      const response = await api.get(`/art-orders/by-email/${encodeURIComponent(emailAddress.trim())}`);
      setArtOrders(response.data || []);
      if (response.data.length === 0) {
        setEmailError('No orders found for this email address.');
      } else {
        setEmailError('');
      }
    } catch (error) {
      console.error('Error fetching art orders:', error);
      setEmailError(error.response?.data?.message || 'Failed to fetch orders. Please try again.');
      setArtOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Request OTP for email verification
  const requestOTP = async () => {
    setEmailError('');
    
    if (!email || !email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if already verified
    const verified = localStorage.getItem('art_orders_verified_email');
    if (verified === email.trim().toLowerCase()) {
      const verifiedTime = localStorage.getItem('art_orders_verified_time');
      const timeDiff = Date.now() - parseInt(verifiedTime);
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (timeDiff < hours24) {
        // Already verified, fetch orders directly
        setIsVerified(true);
        setVerifiedEmail(email.trim().toLowerCase());
        fetchArtOrdersDirect(email.trim());
        return;
      }
    }

    setLoading(true);
    try {
      // Send OTP for email verification
      // Use a dummy order number since we just need to verify email
      await api.post('/email/order-tracking/otp', {
        email: email.trim(),
        orderNumber: 'ART_ORDERS_VIEW' // Special marker for viewing all orders
      });
      setShowOTPModal(true);
    } catch (error) {
      console.error('OTP request error:', error);
      setEmailError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPVerify = async (otp, resend = false) => {
    if (resend) {
      try {
        await api.post('/email/order-tracking/otp', {
          email: email.trim(),
          orderNumber: 'ART_ORDERS_VIEW'
        });
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to resend OTP');
      }
      return;
    }

    try {
      // Verify OTP
      await api.post('/email/order-tracking/verify', {
        email: email.trim(),
        otp
      });

      // OTP verified - store in localStorage and fetch orders
      const normalizedEmail = email.trim().toLowerCase();
      localStorage.setItem('art_orders_verified_email', normalizedEmail);
      localStorage.setItem('art_orders_verified_time', Date.now().toString());
      
      setIsVerified(true);
      setVerifiedEmail(normalizedEmail);
      setShowOTPModal(false);
      
      // Fetch orders
      fetchArtOrdersDirect(email.trim());
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };


  const getStatusColor = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'confirmed': 'bg-green-500/20 text-green-400 border-green-500/50',
      'cancelled': 'bg-red-500/20 text-red-400 border-red-500/50',
      'shipped': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'delivered': 'bg-green-500/20 text-green-400 border-green-500/50'
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'paid': 'bg-green-500/20 text-green-400 border-green-500/50',
      'refunded': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'failed': 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-20 min-h-screen bg-coffee-darkest">
      {/* Header */}
      <section className="py-8 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-coffee-amber mb-2">
            My Art Orders
          </h1>
          <p className="text-coffee-light">
            View and track your art purchase orders
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Email Input Section */}
        <div className="bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    requestOTP();
                  }
                }}
                disabled={isVerified && verifiedEmail === email.trim().toLowerCase()}
                className={`w-full bg-coffee-brown/40 border ${
                  emailError ? 'border-red-500' : 'border-coffee-brown'
                } text-coffee-cream rounded-lg px-4 py-3 text-lg`}
              />
              {emailError && (
                <p className="text-red-400 text-sm mt-2">{emailError}</p>
              )}
            </div>
            <button
              onClick={requestOTP}
              disabled={loading || !email.trim() || (isVerified && verifiedEmail === email.trim().toLowerCase())}
              className="px-6 py-3 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : isVerified && verifiedEmail === email.trim().toLowerCase() ? 'Verified ✓' : 'Verify Email'}
            </button>
          </div>
        </div>

        {/* Art Orders Display */}
        {artOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {artOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 hover:border-coffee-amber/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2 flex-wrap">
                      <h3 className="text-xl font-heading font-bold text-coffee-amber">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-coffee-light mb-3">
                      {formatDate(order.createdAt)}
                    </p>
                    {order.artworkId && (
                      <div className="flex gap-4 items-center">
                        {order.artworkId.image && (
                          <div className="w-24 h-24 bg-coffee-brown/40 rounded-lg flex items-center justify-center flex-shrink-0">
                            <img
                              src={`${order.artworkId.image}?v=${order.artworkId.updatedAt || Date.now()}`}
                              alt={order.artworkId.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-coffee-cream font-semibold text-lg">{order.artworkId.title}</p>
                          <p className="text-coffee-light text-sm">by {order.artworkId.artistName}</p>
                          {order.shippingStatus && (
                            <p className="text-coffee-light text-sm mt-1">
                              Shipping: {order.shippingStatus.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </p>
                          )}
                          {order.trackingNumber && (
                            <p className="text-coffee-amber text-sm mt-1 font-mono">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {order.address && (
                      <div className="mt-3 text-sm text-coffee-light">
                        <p className="font-semibold text-coffee-amber mb-1">Shipping Address:</p>
                        <p>{order.address}, {order.city} - {order.pincode}</p>
                        <p>Phone: {order.phone}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm text-coffee-light">Total</p>
                      <p className="text-2xl font-bold text-coffee-amber">₹{order.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/track-order?orderId=${order.orderNumber}&email=${encodeURIComponent(order.email)}`)}
                      className="px-4 py-2 bg-coffee-amber/20 text-coffee-amber rounded-lg text-sm font-semibold hover:bg-coffee-amber/30 transition-colors"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Orders Message */}
        {artOrders.length === 0 && !loading && isVerified && !emailError && (
          <div className="text-center py-12 bg-coffee-brown/20 rounded-lg">
            <p className="text-coffee-light text-lg">No art orders found for this email address.</p>
          </div>
        )}

        {/* Verification Required Message */}
        {!isVerified && !showOTPModal && (
          <div className="text-center py-12 bg-coffee-brown/20 rounded-lg">
            <p className="text-coffee-light text-lg mb-2">Please verify your email to view your orders.</p>
            <p className="text-coffee-light text-sm">Enter your email and click "Verify Email" to receive an OTP.</p>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
        }}
        email={email}
        type="order-tracking"
        onVerify={handleOTPVerify}
      />
    </div>
  );
};

export default MyArtOrders;

