import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import OTPModal from '../components/OTPModal';

const ArtCheckout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  useEffect(() => {
    fetchArtwork();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [id]);

  const fetchArtwork = async () => {
    try {
      const response = await api.get(`/art/${id}`);
      const art = response.data;
      
      // Check if artwork is available
      if (art.status !== 'available' && art.availability !== 'Available') {
        alert('This artwork is not available for purchase online.');
        navigate('/art-gallery');
        return;
      }
      
      setArtwork(art);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      alert('Artwork not found');
      navigate('/art-gallery');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Invalid pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // First, send OTP for email verification
      await api.post('/email/art-order/otp', {
        email: formData.email,
        orderData: {
          artworkId: id,
          ...formData
        }
      });

      // Store order data for after OTP verification
      setPendingOrderData({
        artworkId: id,
        ...formData
      });

      // Show OTP modal
      setShowOTPModal(true);
      setProcessing(false);
    } catch (error) {
      console.error('OTP sending error:', error);
      alert(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      setProcessing(false);
    }
  };

  const handleOTPVerify = async (otp, resend = false) => {
    if (resend) {
      try {
        await api.post('/email/art-order/otp', {
          email: pendingOrderData.email,
          orderData: pendingOrderData
        });
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to resend OTP');
      }
      return;
    }

    try {
      // Verify OTP
      const verifyResponse = await api.post('/email/art-order/verify', {
        email: pendingOrderData.email,
        otp
      });

      if (!verifyResponse.data.success) {
        throw new Error('OTP verification failed');
      }

      // OTP verified, now create order and proceed with payment
      setShowOTPModal(false);
      setProcessing(true);

      // Create art order
      const orderResponse = await api.post('/art-orders/create', {
        artworkId: pendingOrderData.artworkId,
        ...pendingOrderData
      });

      const { artOrder, razorpayOrder } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Rabuste Coffee',
        description: `Purchase: ${artwork.title}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await api.post('/art-orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              artOrderId: artOrder._id
            });

            if (verifyResponse.data.success) {
              alert('Order placed successfully! Check your email for confirmation. You can view your orders using the "My Orders" button on the art gallery page.');
              navigate('/art-gallery');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert(error.response?.data?.message || 'Payment verification failed. Please contact support.');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: pendingOrderData.customerName,
          email: pendingOrderData.email,
          contact: pendingOrderData.phone
        },
        theme: {
          color: '#FF6F00'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setPendingOrderData(null);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-coffee-amber text-xl">Loading...</div>
      </div>
    );
  }

  if (!artwork) {
    return null;
  }

  return (
    <div className="pt-20 min-h-screen bg-coffee-darkest py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8"
        >
          <h1 className="text-3xl font-heading font-bold text-coffee-amber mb-8">
            Checkout
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Artwork Summary */}
            <div className="bg-coffee-brown/20 rounded-lg p-6">
              <h2 className="text-xl font-heading font-bold text-coffee-amber mb-4">
                Order Summary
              </h2>
              <div className="aspect-square bg-coffee-brown/40 rounded-lg mb-4 flex items-center justify-center">
                {artwork.image ? (
                  <img
                    src={`${artwork.image}?v=${artwork.updatedAt || Date.now()}`}
                    alt={artwork.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-6xl">🎨</span>
                )}
              </div>
              <h3 className="text-lg font-heading font-bold text-coffee-amber mb-2">
                {artwork.title}
              </h3>
              <p className="text-coffee-light mb-4">by {artwork.artistName}</p>
              <div className="flex items-center justify-between pt-4 border-t border-coffee-brown/40">
                <span className="text-lg font-semibold text-coffee-light">Total</span>
                <span className="text-2xl font-bold text-coffee-amber">₹{artwork.price}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.customerName ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="Your full name"
                />
                {errors.customerName && (
                  <p className="text-red-400 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.email ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Mobile *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.phone ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.address ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="Your complete address"
                />
                {errors.address && (
                  <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full bg-coffee-brown/40 border ${
                      errors.city ? 'border-red-500' : 'border-coffee-brown'
                    } text-coffee-cream rounded-lg px-4 py-2`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className={`w-full bg-coffee-brown/40 border ${
                      errors.pincode ? 'border-red-500' : 'border-coffee-brown'
                    } text-coffee-cream rounded-lg px-4 py-2`}
                    placeholder="6-digit pincode"
                  />
                  {errors.pincode && (
                    <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {processing ? 'Processing...' : `Pay ₹${artwork.price}`}
              </button>

              <button
                type="button"
                onClick={() => navigate('/art-gallery')}
                className="w-full bg-coffee-brown/40 text-coffee-cream py-3 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setPendingOrderData(null);
        }}
        email={pendingOrderData?.email || ''}
        type="art-order"
        onVerify={handleOTPVerify}
      />
    </div>
  );
};

export default ArtCheckout;

