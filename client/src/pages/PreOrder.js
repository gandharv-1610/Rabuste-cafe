import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import ReceiptModal from '../components/ReceiptModal';
import CustomerLoginModal from '../components/CustomerLoginModal';
import OTPModal from '../components/OTPModal';
import { generateTimeSlots, isCafeOpen } from '../utils/timeSlots';
import { 
  getCustomerSession, 
  setCustomerSession, 
  isCustomerLoggedIn,
  getCustomerMobile,
  getCustomerName,
  getCustomerEmail
} from '../utils/customerAuth';

const PreOrder = () => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [temperatureFilter, setTemperatureFilter] = useState('All');
  const [milkFilter, setMilkFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [cafeOpen, setCafeOpen] = useState(true);
  const [billingSettings, setBillingSettings] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [discountType, setDiscountType] = useState(''); // 'percentage' or 'fixed' or ''
  const [discountValue, setDiscountValue] = useState('');

  // Load customer session and favorites on mount
  useEffect(() => {
    const session = getCustomerSession();
    if (session) {
      setCustomerMobile(session.mobile || '');
      setCustomerName(session.name || '');
      setCustomerEmail(session.email || '');
      loadFavoritesFromServer(session.mobile);
      checkEmailVerificationStatus(session.mobile);
    } else {
      setShowLoginModal(true);
    }
    
    // Check cafe hours and generate time slots
    const open = isCafeOpen();
    setCafeOpen(open);
    if (open) {
      setTimeSlots(generateTimeSlots());
    }
  }, []);

  // Check email verification status
  const checkEmailVerificationStatus = async (mobile) => {
    if (!mobile) return;
    setCheckingEmailStatus(true);
    try {
      const response = await api.get(`/customers/${mobile}/email-status`);
      setEmailVerified(response.data.emailVerified || false);
      if (response.data.email) {
        setCustomerEmail(response.data.email);
      }
    } catch (error) {
      console.error('Error checking email status:', error);
      setEmailVerified(false);
    } finally {
      setCheckingEmailStatus(false);
    }
  };

  // Load favorites from server
  const loadFavoritesFromServer = async (mobile) => {
    if (!mobile) return;
    try {
      const response = await api.get(`/customers/${mobile}/favorites`);
      if (response.data.favorites) {
        setFavorites(response.data.favorites.map(fav => fav.toString()));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Fetch menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/coffee');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save favorites
  const saveFavorites = async (newFavorites, mobile = null) => {
    localStorage.setItem('rabuste_favorites', JSON.stringify(newFavorites));
    const mobileToUse = mobile || getCustomerMobile();
    if (mobileToUse && isCustomerLoggedIn()) {
      try {
        await api.post(`/customers/${mobileToUse}/favorites`, {
          itemId: newFavorites[newFavorites.length - 1],
          action: 'add'
        });
      } catch (error) {
        console.error('Error saving favorites to server:', error);
      }
    }
  };

  // Toggle favorite
  const toggleFavorite = (itemId) => {
    if (!isCustomerLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  // Handle login success
  const handleLoginSuccess = (customerData) => {
    setCustomerMobile(customerData.mobile || '');
    setCustomerName(customerData.name || '');
    setCustomerEmail(customerData.email || '');
    setShowLoginModal(false);
    if (customerData.mobile) {
      loadFavoritesFromServer(customerData.mobile);
      checkEmailVerificationStatus(customerData.mobile);
    }
  };

  // Add to cart
  const addToCart = (item, priceType = 'Standard') => {
    let price = 0;
    
    if (item.category === 'Coffee') {
      if (priceType === 'Robusta Special' && item.priceRobustaSpecial > 0) {
        price = item.priceRobustaSpecial;
      } else if (priceType === 'Blend' && item.priceBlend > 0) {
        price = item.priceBlend;
      } else {
        price = item.priceRobustaSpecial > 0 ? item.priceRobustaSpecial : item.priceBlend;
        priceType = item.priceRobustaSpecial > 0 ? 'Robusta Special' : 'Blend';
      }
    } else {
      price = item.price;
    }

    const cartItem = {
      itemId: item._id,
      name: item.name,
      price,
      priceType,
      quantity: 1,
      prepTime: item.prepTime || 5,
      category: item.category || 'Coffee'
    };

    setCart(prev => {
      const existing = prev.find(c => c.itemId === item._id && c.priceType === priceType);
      if (existing) {
        return prev.map(c =>
          c.itemId === item._id && c.priceType === priceType
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, cartItem];
    });
  };

  // Update cart item quantity
  const updateQuantity = (itemId, priceType, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.itemId === itemId && item.priceType === priceType) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  // Remove from cart
  const removeFromCart = (itemId, priceType) => {
    setCart(prev => prev.filter(item => !(item.itemId === itemId && item.priceType === priceType)));
  };

  // Fetch billing settings and offers
  useEffect(() => {
    const fetchBillingSettings = async () => {
      try {
        const response = await api.get('/billing/settings');
        setBillingSettings(response.data);
      } catch (error) {
        console.error('Error fetching billing settings:', error);
        // Default to 2.5% CGST and 2.5% SGST if fetch fails
        setBillingSettings({ cgstRate: 2.5, sgstRate: 2.5 });
      }
    };
    
    const fetchOffers = async () => {
      try {
        const response = await api.get('/billing/offers/active');
        setOffers(response.data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };
    
    fetchBillingSettings();
    fetchOffers();
  }, []);
  
  // Check if an offer is applicable to current cart
  const isOfferApplicable = useCallback((offer) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Check minimum order amount
    if (offer.minOrderAmount && subtotal < offer.minOrderAmount) {
      return false;
    }
    
    // Check category restrictions
    if (offer.applicableCategories && offer.applicableCategories.length > 0) {
      const itemCategories = cart.map(item => item.category || 'Coffee');
      const hasMatchingCategory = itemCategories.some(cat => offer.applicableCategories.includes(cat));
      if (!hasMatchingCategory) return false;
    }
    
    // Check item restrictions
    if (offer.applicableItems && offer.applicableItems.length > 0) {
      const itemIds = cart.map(item => item.itemId?.toString());
      const hasMatchingItem = offer.applicableItems.some(offerItemId => 
        itemIds.includes(offerItemId.toString())
      );
      if (!hasMatchingItem) return false;
    }
    
    return true;
  }, [cart]);
  
  // Get applicable offers
  const applicableOffers = offers.filter(offer => isOfferApplicable(offer));
  
  // Reset selected offer if it's no longer applicable
  useEffect(() => {
    if (selectedOffer && !isOfferApplicable(selectedOffer)) {
      setSelectedOffer(null);
    }
  }, [selectedOffer, isOfferApplicable]);
  
  // Reset offer and discount when cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      setSelectedOffer(null);
      setDiscountType('');
      setDiscountValue('');
    }
  }, [cart.length]);

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Calculate offer discount
    let offerDiscountAmount = 0;
    if (selectedOffer) {
      if (selectedOffer.offerType === 'percentage') {
        offerDiscountAmount = (subtotal * selectedOffer.discountValue) / 100;
        if (selectedOffer.maxDiscountAmount && offerDiscountAmount > selectedOffer.maxDiscountAmount) {
          offerDiscountAmount = selectedOffer.maxDiscountAmount;
        }
      } else {
        offerDiscountAmount = selectedOffer.discountValue;
      }
    }
    
    // Calculate manual discount
    let discountAmount = 0;
    if (discountType === 'percentage' && discountValue && parseFloat(discountValue) > 0) {
      discountAmount = (subtotal * parseFloat(discountValue)) / 100;
    } else if (discountType === 'fixed' && discountValue && parseFloat(discountValue) > 0) {
      discountAmount = parseFloat(discountValue);
    }
    
    // Calculate discounted subtotal
    const discountedSubtotal = Math.max(0, subtotal - discountAmount - offerDiscountAmount);
    
    // Use billing settings if available, otherwise default to 2.5% each
    const cgstRate = billingSettings?.cgstRate || 2.5;
    const sgstRate = billingSettings?.sgstRate || 2.5;
    
    // Tax calculation method
    const taxBase = billingSettings?.taxCalculationMethod === 'onSubtotal' ? subtotal : discountedSubtotal;
    
    const cgstAmount = (taxBase * cgstRate) / 100;
    const sgstAmount = (taxBase * sgstRate) / 100;
    const tax = cgstAmount + sgstAmount;
    const total = discountedSubtotal + tax;
    
    return { 
      subtotal, 
      discountAmount, 
      offerDiscountAmount, 
      discountedSubtotal,
      cgstRate, 
      sgstRate, 
      cgstAmount, 
      sgstAmount, 
      tax, 
      total 
    };
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

  // Validate mobile number
  const validateMobile = (mobile) => {
    const cleaned = mobile.replace(/[\s-]/g, '');
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  };

  // Validate email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Send OTP for email verification
  const sendOTP = async () => {
    if (!customerEmail || !validateEmail(customerEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!customerMobile || !validateMobile(customerMobile)) {
      setMobileError('Please enter a valid mobile number');
      return;
    }

    try {
      await api.post('/customers/email/otp', {
        email: customerEmail.trim(),
        mobile: customerMobile.trim()
      });
      setShowOTPModal(true);
      setEmailError('');
    } catch (error) {
      setEmailError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  // Verify OTP
  const verifyOTP = async (otp, isResend = false) => {
    if (isResend) {
      await sendOTP();
      return;
    }

    if (!otp || otp.length !== 6) {
      throw new Error('Please enter complete OTP');
    }

    try {
      const response = await api.post('/customers/email/verify', {
        email: customerEmail.trim(),
        otp,
        mobile: customerMobile.trim()
      });
      
      setEmailVerified(true);
      setShowOTPModal(false);
      
      // Update customer session
      const session = getCustomerSession();
      if (session) {
        setCustomerSession({
          ...session,
          email: response.data.customer.email,
          emailVerified: true
        });
      }
    } catch (error) {
      throw error;
    }
  };

  // Place pre-order
  const handlePlaceOrder = async () => {
    setMobileError('');
    setNameError('');
    setEmailError('');

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!cafeOpen) {
      alert('Cafe is currently closed. Pre-orders are available from 11 AM to 11 PM.');
      return;
    }

    if (!selectedTimeSlot) {
      alert('Please select a pickup time slot');
      return;
    }

    const session = getCustomerSession();
    let finalMobile = customerMobile.trim();
    let finalName = customerName.trim();
    let finalEmail = customerEmail.trim();

    if (session) {
      finalMobile = session.mobile || finalMobile;
      finalName = session.name || finalName;
      finalEmail = session.email || finalEmail;
    }

    if (!finalMobile || !validateMobile(finalMobile)) {
      setMobileError('Please enter a valid Indian mobile number (10 digits)');
      return;
    }

    if (!finalName || finalName.trim().length < 2) {
      setNameError('Name is required and must be at least 2 characters');
      return;
    }

    if (!finalEmail || !validateEmail(finalEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check email verification
    if (!emailVerified) {
      setEmailError('Please verify your email address first');
      setShowOTPModal(true);
      return;
    }

    try {
      const { total } = calculateTotals();
      
      // Find selected time slot details
      const slot = timeSlots.find(s => s.value === selectedTimeSlot);
      if (!slot) {
        alert('Invalid time slot selected');
        return;
      }

      // Create pre-order
      const orderData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          priceType: item.priceType
        })),
        customerMobile: finalMobile,
        customerName: finalName,
        customerEmail: finalEmail,
        notes: notes || '',
        discountType: discountType || '',
        discountValue: discountValue ? parseFloat(discountValue) : 0,
        appliedOfferId: selectedOffer?._id || null,
        orderSource: 'PreOrder',
        isPreOrder: true,
        pickupTimeSlot: selectedTimeSlot,
        pickupTime: slot.startTime,
        paymentMethod: 'Razorpay' // Pre-orders must be paid online
      };

      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;

      // Create Razorpay payment order
      const paymentResponse = await api.post('/payment/create-order', {
        amount: total,
        orderId: order._id,
        customerName: finalName,
        customerEmail: finalEmail
      });

      // Initialize Razorpay checkout
      const options = {
        key: paymentResponse.data.key,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        name: 'Rabuste Coffee',
        description: `Pre-Order #${order.orderNumber} - Pickup: ${selectedTimeSlot}`,
        order_id: paymentResponse.data.id,
        handler: async function (response) {
          try {
            const verifyResponse = await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });

            if (verifyResponse.data.success) {
              const updatedOrder = await api.get(`/orders/${order._id}`);
              setOrderPlaced(updatedOrder.data);
              setCart([]);
              setShowReceipt(true);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support with your order number.');
          }
        },
        prefill: {
          name: finalName,
          email: finalEmail
        },
        theme: {
          color: '#FF8C00'
        },
        modal: {
          ondismiss: function() {
            alert('Payment cancelled. Your pre-order has been created but payment is pending.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error placing pre-order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place pre-order. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Favorites') return favorites.includes(item._id);
    if (item.category !== selectedCategory) return false;
    
    if (selectedCategory === 'Coffee' && item.category === 'Coffee') {
      if (temperatureFilter !== 'All' && item.subcategory !== temperatureFilter) return false;
      if (milkFilter !== 'All' && item.milkType !== milkFilter) return false;
    }
    return true;
  });

  const categories = ['All', 'Coffee', 'Shakes', 'Sides', 'Tea', 'Favorites'];
  const { subtotal, discountAmount, offerDiscountAmount, discountedSubtotal, cgstRate, sgstRate, cgstAmount, sgstAmount, tax, total } = calculateTotals();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-coffee-amber text-xl">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <section className="py-8 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-coffee-amber mb-2">
                Pre-Order
              </h1>
              <p className="text-coffee-light">
                Order ahead and pick up at your convenience • Online payment required
              </p>
              {!cafeOpen && (
                <p className="text-red-400 text-sm mt-2">
                  ⚠️ Cafe is currently closed. Pre-orders available 11 AM - 11 PM
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/your-orders')}
                className="px-4 py-2 bg-coffee-brown/60 text-coffee-cream rounded-lg font-semibold hover:bg-coffee-brown/80"
              >
                Your Orders
              </button>
              <button
                onClick={() => navigate('/coffee')}
                className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Order Placed Success */}
      <AnimatePresence>
        {orderPlaced && showReceipt && (
          <ReceiptModal
            order={orderPlaced}
            onClose={() => {
              setShowReceipt(false);
              setOrderPlaced(null);
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section - Same as Order page */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-coffee-amber text-coffee-darker shadow-lg'
                      : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
                  }`}
                >
                  {cat === 'Favorites' ? `⭐ ${cat}` : cat}
                </button>
              ))}
            </div>

            {/* Temperature and Milk Filters (only for Coffee category) */}
            {selectedCategory === 'Coffee' && (
              <div className="mb-6 flex flex-wrap gap-4 bg-coffee-brown/20 rounded-lg p-4 border border-coffee-brown/50">
                <div className="flex items-center gap-2">
                  <label className="text-coffee-amber font-semibold text-sm">Temperature:</label>
                  <div className="flex gap-2 bg-coffee-darker/50 p-1 rounded-full border border-coffee-brown/30">
                    {['All', 'Hot', 'Cold'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setTemperatureFilter(option)}
                        className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${
                          temperatureFilter === option
                            ? 'bg-coffee-amber text-coffee-darker shadow-lg'
                            : 'text-coffee-cream hover:bg-coffee-brown/40'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-coffee-amber font-semibold text-sm">Milk Type:</label>
                  <div className="flex gap-2 bg-coffee-darker/50 p-1 rounded-full border border-coffee-brown/30">
                    {['All', 'Milk', 'Non-Milk'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setMilkFilter(option)}
                        className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${
                          milkFilter === option
                            ? 'bg-coffee-amber text-coffee-darker shadow-lg'
                            : 'text-coffee-cream hover:bg-coffee-brown/40'
                        }`}
                      >
                        {option === 'Milk' ? 'With Milk' : option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Favorites Section */}
            {selectedCategory === 'Favorites' && favorites.length === 0 && (
              <div className="text-center py-12 bg-coffee-brown/20 rounded-lg">
                <p className="text-coffee-light">No favorites yet. Start adding items to your favorites!</p>
              </div>
            )}

            {/* Menu Grid - Same structure as Order page */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredItems.map(item => {
                const isFavorite = favorites.includes(item._id);
                const isCoffee = item.category === 'Coffee';
                const hasBlend = item.priceBlend > 0;
                const hasRobusta = item.priceRobustaSpecial > 0;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-coffee-brown/30 rounded-lg p-4 border border-coffee-brown/50 hover:border-coffee-amber/50 transition-all"
                  >
                    <div className="flex gap-4">
                      {(item.image || item.cloudinary_url) && (
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-coffee-brown/40">
                          <img
                            src={`${item.cloudinary_url || item.image}?v=${item.updatedAt || Date.now()}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-heading font-bold text-coffee-amber flex-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => toggleFavorite(item._id)}
                            className="text-2xl hover:scale-110 transition-transform"
                          >
                            {isFavorite ? '⭐' : '☆'}
                          </button>
                        </div>
                        <p className="text-sm text-coffee-light mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {/* Prices */}
                        <div className="mb-3">
                          {isCoffee ? (
                            <div className="flex flex-col gap-1">
                              {hasBlend && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-coffee-light">Blend:</span>
                                  <span className="text-coffee-amber font-bold">₹{item.priceBlend.toFixed(2)}</span>
                                </div>
                              )}
                              {hasRobusta && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-coffee-light">Robusta Special:</span>
                                  <span className="text-coffee-amber font-bold">₹{item.priceRobustaSpecial.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-coffee-light">Price:</span>
                              <span className="text-coffee-amber font-bold">₹{item.price.toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {/* Add to Cart Buttons */}
                        <div className="flex gap-2">
                          {isCoffee && hasBlend && (
                            <button
                              onClick={() => addToCart(item, 'Blend')}
                              className="flex-1 px-3 py-1.5 bg-coffee-amber/20 text-coffee-amber rounded text-xs font-semibold hover:bg-coffee-amber/30 transition-colors"
                            >
                              Add Blend
                            </button>
                          )}
                          {isCoffee && hasRobusta && (
                            <button
                              onClick={() => addToCart(item, 'Robusta Special')}
                              className="flex-1 px-3 py-1.5 bg-coffee-amber/20 text-coffee-amber rounded text-xs font-semibold hover:bg-coffee-amber/30 transition-colors"
                            >
                              Add Robusta
                            </button>
                          )}
                          {!isCoffee && (
                            <button
                              onClick={() => addToCart(item)}
                              className="w-full px-3 py-1.5 bg-coffee-amber text-coffee-darker rounded text-xs font-semibold hover:bg-coffee-gold transition-colors"
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 flex flex-col max-h-[calc(100vh-8rem)]">
              <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4 flex-shrink-0">
                Your Pre-Order
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-coffee-light">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  {/* Cart Items - Scrollable with better styling */}
                  <div className="mb-3 flex-shrink-0">
                    <div className="text-xs text-coffee-light/70 mb-1.5 font-semibold">Cart Items ({cart.length})</div>
                    <div 
                      className="space-y-1.5 overflow-y-auto pr-2 scrollbar-thin"
                      style={{ 
                        maxHeight: cart.length > 2 ? '120px' : 'auto'
                      }}
                    >
                      {cart.map((item, idx) => (
                        <div key={idx} className="bg-coffee-brown/40 rounded p-2 border border-coffee-brown/30">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-semibold text-coffee-cream truncate">{item.name}</p>
                              {item.priceType !== 'Standard' && (
                                <p className="text-xs text-coffee-light/80">{item.priceType}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.itemId, item.priceType)}
                              className="text-coffee-light hover:text-coffee-amber flex-shrink-0 ml-1"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQuantity(item.itemId, item.priceType, -1)}
                                className="w-5 h-5 rounded bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown text-xs flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="text-xs text-coffee-cream w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.itemId, item.priceType, 1)}
                                className="w-5 h-5 rounded bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown text-xs flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs font-semibold text-coffee-amber">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-coffee-brown/50 pt-3 space-y-1.5 mb-3 flex-shrink-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-coffee-light">Subtotal:</span>
                      <span className="text-coffee-cream">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {offerDiscountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-coffee-light">Offer Discount ({selectedOffer?.name}):</span>
                        <span className="text-green-400">-₹{offerDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-coffee-light">Manual Discount:</span>
                        <span className="text-green-400">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {(offerDiscountAmount > 0 || discountAmount > 0) && (
                      <div className="flex justify-between text-sm pt-1 border-t border-coffee-brown/30">
                        <span className="text-coffee-light font-semibold">Discounted Subtotal:</span>
                        <span className="text-coffee-cream font-semibold">₹{discountedSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-coffee-light">CGST ({cgstRate.toFixed(1)}%):</span>
                      <span className="text-coffee-cream">₹{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-coffee-light">SGST ({sgstRate.toFixed(1)}%):</span>
                      <span className="text-coffee-cream">₹{sgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-coffee-brown/30">
                      <span className="text-coffee-light font-semibold">Total GST:</span>
                      <span className="text-coffee-cream font-semibold">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-coffee-brown/50">
                      <span className="text-coffee-amber">Total:</span>
                      <span className="text-coffee-amber">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Scrollable Form Section - Guaranteed minimum space */}
                  <div 
                    className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin"
                    style={{ minHeight: '350px' }}
                  >
                    {/* Offers Section */}
                    {applicableOffers.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-coffee-amber mb-2">
                          Available Offers
                        </label>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOffer(null)}
                            className={`w-full text-left p-2 rounded-lg border text-xs transition-colors ${
                              !selectedOffer
                                ? 'bg-coffee-amber/20 border-coffee-amber text-coffee-amber'
                                : 'bg-coffee-brown/40 border-coffee-brown text-coffee-light hover:bg-coffee-brown/60'
                            }`}
                          >
                            No Offer
                          </button>
                          {applicableOffers.map((offer) => (
                            <button
                              key={offer._id}
                              type="button"
                              onClick={() => setSelectedOffer(offer)}
                              className={`w-full text-left p-2 rounded-lg border text-xs transition-colors ${
                                selectedOffer?._id === offer._id
                                  ? 'bg-coffee-amber/20 border-coffee-amber text-coffee-amber'
                                  : 'bg-coffee-brown/40 border-coffee-brown text-coffee-light hover:bg-coffee-brown/60'
                              }`}
                            >
                              <div className="font-semibold">{offer.name}</div>
                              {offer.description && (
                                <div className="text-xs text-coffee-light/80 mt-0.5">{offer.description}</div>
                              )}
                              <div className="text-xs text-coffee-amber mt-1">
                                {offer.offerType === 'percentage' 
                                  ? `${offer.discountValue}% OFF` 
                                  : `₹${offer.discountValue} OFF`}
                                {offer.minOrderAmount > 0 && ` (Min. ₹${offer.minOrderAmount})`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discount Section */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-coffee-amber mb-2">
                        Additional Discount (Optional)
                      </label>
                      <div className="space-y-2">
                        <select
                          value={discountType}
                          onChange={(e) => {
                            setDiscountType(e.target.value);
                            if (!e.target.value) setDiscountValue('');
                          }}
                          className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">No Discount</option>
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                        {discountType && (
                          <input
                            type="number"
                            placeholder={discountType === 'percentage' ? 'Enter percentage (e.g., 10)' : 'Enter amount (e.g., 50)'}
                            value={discountValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (discountType === 'percentage') {
                                if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 100)) {
                                  setDiscountValue(val);
                                }
                              } else {
                                if (val === '' || parseFloat(val) >= 0) {
                                  setDiscountValue(val);
                                }
                              }
                            }}
                            min="0"
                            max={discountType === 'percentage' ? '100' : undefined}
                            step={discountType === 'percentage' ? '0.1' : '1'}
                            className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-coffee-amber mb-2">
                        Select Pickup Time Slot *
                      </label>
                      {timeSlots.length === 0 ? (
                        <p className="text-red-400 text-sm">
                          No time slots available. Cafe hours: 11 AM - 11 PM
                        </p>
                      ) : (
                        <select
                          value={selectedTimeSlot}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Select time slot</option>
                          {timeSlots.map((slot, idx) => (
                            <option key={idx} value={slot.value}>
                              {slot.display}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3 mb-4">
                    <div>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="Mobile number * (10 digits)"
                          value={customerMobile}
                          onChange={(e) => {
                            setCustomerMobile(e.target.value);
                            setMobileError('');
                          }}
                          className={`w-full bg-coffee-brown/40 border ${
                            mobileError ? 'border-red-500' : 'border-coffee-brown'
                          } text-coffee-cream rounded-lg px-3 py-2 text-sm pr-10`}
                          maxLength={13}
                        />
                        {isLoadingCustomer && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-coffee-amber border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      {mobileError && (
                        <p className="text-red-400 text-xs mt-1">{mobileError}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Your name *"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setNameError('');
                        }}
                        className={`w-full bg-coffee-brown/40 border ${
                          nameError ? 'border-red-500' : 'border-coffee-brown'
                        } text-coffee-cream rounded-lg px-3 py-2 text-sm`}
                      />
                      {nameError && (
                        <p className="text-red-400 text-xs mt-1">{nameError}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Email * (for verification)"
                          value={customerEmail}
                          onChange={(e) => {
                            setCustomerEmail(e.target.value);
                            setEmailError('');
                          }}
                          className={`flex-1 bg-coffee-brown/40 border ${
                            emailError ? 'border-red-500' : emailVerified ? 'border-green-500' : 'border-coffee-brown'
                          } text-coffee-cream rounded-lg px-3 py-2 text-sm`}
                        />
                        {!emailVerified && customerEmail && (
                          <button
                            onClick={sendOTP}
                            className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg text-xs font-semibold hover:bg-coffee-gold whitespace-nowrap"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                      {emailError && (
                        <p className="text-red-400 text-xs mt-1">{emailError}</p>
                      )}
                      {emailVerified && (
                        <p className="text-green-400 text-xs mt-1">✓ Email verified</p>
                      )}
                      {checkingEmailStatus && (
                        <p className="text-coffee-light text-xs mt-1">Checking email status...</p>
                      )}
                    </div>
                    <textarea
                      placeholder="Special instructions (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                      className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                    />
                    </div>
                  </div>

                  {/* Fixed Button at Bottom */}
                  <div className="flex-shrink-0 pt-4 border-t border-coffee-brown/50">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!cafeOpen || !selectedTimeSlot || !emailVerified}
                      className="w-full bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker py-3 rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Place Pre-Order & Pay Online
                    </button>
                    {(!cafeOpen || !selectedTimeSlot || !emailVerified) && (
                      <p className="text-xs text-red-400 mt-2 text-center">
                        {!cafeOpen && 'Cafe is closed. '}
                        {!selectedTimeSlot && 'Please select a time slot. '}
                        {!emailVerified && 'Please verify your email. '}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => {
          if (isCustomerLoggedIn()) {
            setShowLoginModal(false);
          }
        }}
        onSuccess={handleLoginSuccess}
        requireName={false}
        title="Login to Pre-Order"
      />

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={customerEmail}
        onVerify={verifyOTP}
        type="customer-email"
      />

      <Chatbot />
    </div>
  );
};

export default PreOrder;

