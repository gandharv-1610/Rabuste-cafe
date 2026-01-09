import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import OTPModal from '../components/OTPModal';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderId') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  useEffect(() => {
    if (orderNumber && email) {
      // Check if email is already verified from MyArtOrders
      const verified = localStorage.getItem('art_orders_verified_email');
      const verifiedTime = localStorage.getItem('art_orders_verified_time');
      
      if (verified && verifiedTime) {
        const normalizedEmail = email.trim().toLowerCase();
        const timeDiff = Date.now() - parseInt(verifiedTime);
        const hours24 = 24 * 60 * 60 * 1000;
        
        // If same email and still valid (24 hours), skip OTP and fetch order directly
        if (verified === normalizedEmail && timeDiff < hours24) {
          fetchOrderDirect();
          return;
        }
      }
      
      // Otherwise, request OTP
      requestOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrderDirect = async () => {
    setLoading(true);
    try {
      const response = await api.post('/art-orders/track', {
        orderNumber: orderNumber.toUpperCase(),
        email: email.trim().toLowerCase()
      });
      setOrder(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch order. Please verify your email.');
      console.error('Order fetch error:', error);
      // If direct fetch fails, fall back to OTP verification
      requestOTP();
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async () => {
    if (!orderNumber || !email) {
      toast.error('Please enter order number and email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/email/order-tracking/otp', {
        email,
        orderNumber
      });
      setShowOTPModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please check your order number and email.');
      console.error('OTP request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp, resend = false) => {
    if (resend) {
      try {
        await api.post('/email/order-tracking/otp', {
          email,
          orderNumber
        });
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to resend OTP');
      }
      return;
    }

    try {
      const response = await api.post('/email/order-tracking/verify', {
        email,
        otp
      });

      if (response.data.success) {
        setOrder(response.data.order);
        setShowOTPModal(false);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'confirmed': 'bg-green-500/20 text-green-400',
      'cancelled': 'bg-red-500/20 text-red-400',
      'shipped': 'bg-blue-500/20 text-blue-400',
      'delivered': 'bg-green-500/20 text-green-400'
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'paid': 'bg-green-500/20 text-green-400',
      'refunded': 'bg-blue-500/20 text-blue-400',
      'failed': 'bg-red-500/20 text-red-400'
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getShippingStatusColor = (status) => {
    const statusMap = {
      'pending': 'bg-gray-500/20 text-gray-400',
      'processing': 'bg-yellow-500/20 text-yellow-400',
      'shipped': 'bg-blue-500/20 text-blue-400',
      'out_for_delivery': 'bg-purple-500/20 text-purple-400',
      'delivered': 'bg-green-500/20 text-green-400'
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="pt-20 min-h-screen bg-coffee-darkest py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {!order ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8"
          >
            <h1 className="text-3xl font-heading font-bold text-coffee-amber mb-6">
              Track Your Order
            </h1>
            <p className="text-coffee-light mb-6">
              Enter your order number and email to track your art purchase
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Order Number *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="ART12345678"
                />
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                onClick={requestOTP}
                disabled={loading || !orderNumber || !email}
                className="w-full bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Request OTP'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8"
          >
            <h1 className="text-3xl font-heading font-bold text-coffee-amber mb-6">
              Order Details
            </h1>

            {/* Order Info */}
            <div className="bg-coffee-brown/20 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-coffee-light text-sm mb-1">Order Number</p>
                  <p className="text-coffee-amber font-bold text-lg">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-coffee-light text-sm mb-1">Order Date</p>
                  <p className="text-coffee-cream">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Artwork Info */}
            {order.artworkId && (
              <div className="bg-coffee-brown/20 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-heading font-bold text-coffee-amber mb-4">
                  Artwork Details
                </h2>
                <div className="flex gap-4">
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
                    <h3 className="text-lg font-heading font-bold text-coffee-amber mb-1">
                      {order.artworkId.title}
                    </h3>
                    <p className="text-coffee-light mb-2">by {order.artworkId.artistName}</p>
                    <p className="text-coffee-amber font-bold">₹{order.price}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-coffee-brown/20 rounded-lg p-4">
                <p className="text-coffee-light text-sm mb-2">Order Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
              <div className="bg-coffee-brown/20 rounded-lg p-4">
                <p className="text-coffee-light text-sm mb-2">Payment Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              <div className="bg-coffee-brown/20 rounded-lg p-4">
                <p className="text-coffee-light text-sm mb-2">Shipping Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getShippingStatusColor(order.shippingStatus)}`}>
                  {order.shippingStatus.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-coffee-brown/20 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-heading font-bold text-coffee-amber mb-4">
                Shipping Address
              </h2>
              <p className="text-coffee-cream">
                {order.customerName}<br />
                {order.address}<br />
                {order.city} - {order.pincode}<br />
                Phone: {order.phone}
              </p>
            </div>

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="bg-coffee-brown/20 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-heading font-bold text-coffee-amber mb-2">
                  Tracking Number
                </h2>
                <p className="text-coffee-cream font-mono">{order.trackingNumber}</p>
              </div>
            )}

            {/* Cancellation Reason */}
            {order.orderStatus === 'cancelled' && order.cancellationReason && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-heading font-bold text-red-400 mb-2">
                  Cancellation Reason
                </h2>
                <p className="text-coffee-cream">{order.cancellationReason}</p>
                {order.paymentStatus === 'refunded' && (
                  <p className="text-green-400 mt-4 font-semibold">
                    ✓ Refund has been processed and will be credited within 5-7 working days.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/art-gallery')}
              className="w-full bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
            >
              Back to Gallery
            </button>
          </motion.div>
        )}

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
    </div>
  );
};

export default OrderTracking;

