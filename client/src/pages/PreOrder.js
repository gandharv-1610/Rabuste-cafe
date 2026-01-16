import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import CoffeeDiscovery from '../components/CoffeeDiscovery';
import ReceiptModal from '../components/ReceiptModal';
import CustomerLoginModal from '../components/CustomerLoginModal';
import CoffeeLoader from '../components/CoffeeLoader';
import OTPModal from '../components/OTPModal';
import DailyOffersPopup from '../components/DailyOffersPopup';
import { generateTimeSlots, isCafeOpen } from '../utils/timeSlots';
import {
  getCustomerSession,
  setCustomerSession,
  isCustomerLoggedIn,
  getCustomerMobile
} from '../utils/customerAuth';

const PreOrder = () => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [temperatureFilter, setTemperatureFilter] = useState('All');
  const [milkFilter, setMilkFilter] = useState('All');
  const [priceSort, setPriceSort] = useState('None'); // None, lowToHigh, highToLow
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
  const [preorderSettings, setPreorderSettings] = useState(null);
  const [preorderEnabled, setPreorderEnabled] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());
  const [cartShake, setCartShake] = useState(0);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false); // AI Discovery modal state
  const [showDiscoveryBanner, setShowDiscoveryBanner] = useState(true); // Show promotional banner
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // Chatbot open state
  const [showMobileCart, setShowMobileCart] = useState(false); // Mobile cart drawer state
  const cartRef = useRef(null);

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

    // Fetch preorder settings
    const fetchPreorderSettings = async () => {
      try {
        const response = await api.get('/billing/preorder-settings');
        setPreorderSettings(response.data);
        setPreorderEnabled(response.data.isEnabled !== false);
      } catch (error) {
        console.error('Error fetching preorder settings:', error);
        // Default to enabled if fetch fails
        setPreorderEnabled(true);
      }
    };
    fetchPreorderSettings();
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

    // Create unique key for this item+priceType combination
    const itemKey = `${item._id}-${priceType}`;

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

    // Show "Added" state on button
    setRecentlyAdded(prev => new Set([...prev, itemKey]));

    // Show toast notification
    toast.success(`${item.name} added`);

    // Trigger cart shake animation
    setCartShake(prev => prev + 1);

    // Reset "Added" state after 2 seconds
    setTimeout(() => {
      setRecentlyAdded(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }, 2000);
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

  // Auto-apply best applicable offer when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      setSelectedOffer(null);
      return;
    }

    // Find the best applicable offer (highest priority, then highest discount)
    const bestOffer = applicableOffers.reduce((best, current) => {
      if (!best) return current;

      // Compare by priority first
      if (current.priority !== best.priority) {
        return current.priority > best.priority ? current : best;
      }

      // If same priority, compare discount value
      const currentDiscount = current.offerType === 'percentage'
        ? (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * current.discountValue / 100)
        : current.discountValue;
      const bestDiscount = best.offerType === 'percentage'
        ? (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * best.discountValue / 100)
        : best.discountValue;

      return currentDiscount > bestDiscount ? current : best;
    }, null);

    setSelectedOffer(bestOffer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, offers]);

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate offer discount (auto-applied) - only on matching items
    let offerDiscountAmount = 0;
    if (selectedOffer) {
      // Get items that match the offer
      const matchingItems = cart.filter(item => {
        // If offer has specific items, check if this item is in the list
        if (selectedOffer.applicableItems && selectedOffer.applicableItems.length > 0) {
          return selectedOffer.applicableItems.some(offerItemId =>
            item.itemId?.toString() === offerItemId.toString()
          );
        }
        // If offer has categories, check if this item's category matches
        if (selectedOffer.applicableCategories && selectedOffer.applicableCategories.length > 0) {
          return selectedOffer.applicableCategories.includes(item.category || 'Coffee');
        }
        // If no restrictions, apply to all items
        return true;
      });

      // Calculate subtotal for matching items only
      const matchingSubtotal = matchingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (selectedOffer.offerType === 'percentage') {
        offerDiscountAmount = (matchingSubtotal * selectedOffer.discountValue) / 100;
        if (selectedOffer.maxDiscountAmount && offerDiscountAmount > selectedOffer.maxDiscountAmount) {
          offerDiscountAmount = selectedOffer.maxDiscountAmount;
        }
      } else {
        offerDiscountAmount = Math.min(selectedOffer.discountValue, matchingSubtotal);
      }
    }

    // Calculate discounted subtotal
    const discountedSubtotal = Math.max(0, subtotal - offerDiscountAmount);

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
      toast.error('Your cart is empty');
      return;
    }

    if (!cafeOpen) {
      toast.error('Cafe is currently closed. Pre-orders are available from 11 AM to 11 PM.');
      return;
    }

    if (!selectedTimeSlot) {
      toast.error('Please select a pickup time slot');
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
        toast.error('Invalid time slot selected');
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
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support with your order number.');
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
          ondismiss: function () {
            toast.warning('Payment cancelled. Your pre-order has been created but payment is pending.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error placing pre-order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place pre-order. Please try again.';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Helper to determine base price for sorting (handles coffee with multiple price types)
  const getItemBasePrice = (item) => {
    if (item.category === 'Coffee') {
      const prices = [];
      if (item.priceBlend && item.priceBlend > 0) {
        prices.push(item.priceBlend);
      }
      if (item.priceRobustaSpecial && item.priceRobustaSpecial > 0) {
        prices.push(item.priceRobustaSpecial);
      }
      if (prices.length === 0) return Number.MAX_VALUE;
      return Math.min(...prices);
    }
    if (item.price && item.price > 0) {
      return item.price;
    }
    return Number.MAX_VALUE;
  };

  // Filter and sort menu items
  const filteredItems = (() => {
    const items = menuItems.filter(item => {
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Favorites') return favorites.includes(item._id);
      if (item.category !== selectedCategory) return false;

      if (selectedCategory === 'Coffee' && item.category === 'Coffee') {
        if (temperatureFilter !== 'All' && item.subcategory !== temperatureFilter) return false;
        if (milkFilter !== 'All' && item.milkType !== milkFilter) return false;
      }
      return true;
    });

    if (priceSort === 'lowToHigh' || priceSort === 'highToLow') {
      return [...items].sort((a, b) => {
        const priceA = getItemBasePrice(a);
        const priceB = getItemBasePrice(b);
        if (priceA === priceB) return 0;
        return priceSort === 'lowToHigh' ? priceA - priceB : priceB - priceA;
      });
    }

    return items;
  })();

  const categories = ['All', 'Coffee', 'Shakes', 'Sides', 'Tea', 'Favorites'];
  const { subtotal, offerDiscountAmount, discountedSubtotal, cgstRate, sgstRate, cgstAmount, sgstAmount, tax, total } = calculateTotals();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <CoffeeLoader size="lg" />
      </div>
    );
  }

  // Show message if preorder is disabled
  if (!preorderEnabled) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-coffee-brown/40 border border-coffee-brown/50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-3xl font-heading font-bold text-coffee-amber mb-4">
              Pre-Order Currently Unavailable
            </h1>
            <p className="text-coffee-light text-lg mb-6">
              {preorderSettings?.message || "Currently we're not accepting any preorder. Kindly check later."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/coffee')}
                className="px-6 py-3 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold"
              >
                Order In Cafe
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-coffee-brown/60 text-coffee-cream rounded-lg font-semibold hover:bg-coffee-brown/80"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* AI Discovery Promotional Banner */}
      <AnimatePresence>
        {showDiscoveryBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-gradient-to-r from-coffee-amber/20 via-coffee-gold/20 to-coffee-amber/20 border-b border-coffee-amber/30 px-4 py-3"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-coffee-cream font-semibold">
                    <span className="text-coffee-amber">✨ New!</span> Not sure what to order? Try our <span className="text-coffee-amber font-bold">AI Coffee Discovery</span> to find your perfect brew!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsDiscoveryOpen(true);
                    setShowDiscoveryBanner(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-lg font-bold text-sm hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg hover:shadow-xl"
                >
                  Try It Now
                </button>
                <button
                  onClick={() => setShowDiscoveryBanner(false)}
                  className="p-1 text-coffee-light hover:text-coffee-cream transition-colors"
                  aria-label="Close banner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="py-6 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                onClick={() => setIsDiscoveryOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-lg font-semibold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="hidden sm:inline">AI Discovery</span>
                <span className="sm:hidden">AI</span>
              </button>
              <button
                onClick={() => navigate('/your-orders')}
                className="px-4 py-2 bg-coffee-brown/60 text-coffee-cream rounded-lg font-semibold hover:bg-coffee-brown/80 text-sm sm:text-base w-full sm:w-auto"
              >
                Your Orders
              </button>
              <button
                onClick={() => navigate('/coffee')}
                className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold text-sm sm:text-base w-full sm:w-auto"
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                    ? 'bg-coffee-amber text-coffee-darker shadow-lg'
                    : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
                    }`}
                >
                  {cat === 'Favorites' ? `⭐ ${cat}` : cat}
                </button>
              ))}
            </div>

            {/* Temperature, Milk and Price Filters */}
            <div className="mb-6 flex flex-wrap gap-4 bg-coffee-brown/20 rounded-lg p-4 border border-coffee-brown/50">
              {/* Temperature & Milk only affect Coffee items */}
              {selectedCategory === 'Coffee' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-coffee-amber font-semibold text-sm">Temperature:</label>
                    <div className="flex gap-2 bg-coffee-darker/50 p-1 rounded-full border border-coffee-brown/30">
                      {['All', 'Hot', 'Cold'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setTemperatureFilter(option)}
                          className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${temperatureFilter === option
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
                          className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${milkFilter === option
                            ? 'bg-coffee-amber text-coffee-darker shadow-lg'
                            : 'text-coffee-cream hover:bg-coffee-brown/40'
                            }`}
                        >
                          {option === 'Milk' ? 'With Milk' : option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Price Sort - applies to all categories */}
              <div className="flex items-center gap-2">
                <label className="text-coffee-amber font-semibold text-sm">Price:</label>
                <div className="flex gap-2 bg-coffee-darker/50 p-1 rounded-full border border-coffee-brown/30">
                  {[
                    { label: 'Default', value: 'None' },
                    { label: 'Low → High', value: 'lowToHigh' },
                    { label: 'High → Low', value: 'highToLow' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPriceSort(option.value)}
                      className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${priceSort === option.value
                        ? 'bg-coffee-amber text-coffee-darker shadow-lg'
                        : 'text-coffee-cream hover:bg-coffee-brown/40'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
                    <div className={`flex gap-4 ${isCoffee ? 'flex-col sm:flex-row' : ''}`}>
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
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <span className="text-xs text-coffee-light">Blend:</span>
                                  <span className="text-coffee-amber font-bold">₹{item.priceBlend.toFixed(2)}</span>
                                </div>
                              )}
                              {hasRobusta && (
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <span className="text-xs text-coffee-light">Robusta Special:</span>
                                  <span className="text-coffee-amber font-bold">₹{item.priceRobustaSpecial.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs text-coffee-light">Price:</span>
                              <span className="text-coffee-amber font-bold">₹{item.price.toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {/* Add to Cart Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          {isCoffee && hasBlend && (
                            <button
                              onClick={() => addToCart(item, 'Blend')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-all ${recentlyAdded.has(`${item._id}-Blend`)
                                ? 'bg-green-500/30 text-green-400'
                                : 'bg-coffee-amber text-coffee-darker hover:bg-coffee-gold'
                                }`}
                            >
                              {recentlyAdded.has(`${item._id}-Blend`) ? '✓ Added' : 'Add Blend'}
                            </button>
                          )}
                          {isCoffee && hasRobusta && (
                            <button
                              onClick={() => addToCart(item, 'Robusta Special')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-all ${recentlyAdded.has(`${item._id}-Robusta Special`)
                                ? 'bg-green-500/30 text-green-400'
                                : 'bg-coffee-amber text-coffee-darker hover:bg-coffee-gold'
                                }`}
                            >
                              {recentlyAdded.has(`${item._id}-Robusta Special`) ? '✓ Added' : 'Add Robusta'}
                            </button>
                          )}
                          {!isCoffee && (
                            <button
                              onClick={() => addToCart(item)}
                              className={`w-full px-3 py-1.5 rounded text-xs font-semibold transition-all ${recentlyAdded.has(`${item._id}-Standard`)
                                ? 'bg-green-500/30 text-green-400'
                                : 'bg-coffee-amber text-coffee-darker hover:bg-coffee-gold'
                                }`}
                            >
                              {recentlyAdded.has(`${item._id}-Standard`) ? '✓ Added' : 'Add to Cart'}
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
            <motion.div
              ref={cartRef}
              key={cartShake}
              animate={cartShake > 0 ? {
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5, ease: "easeInOut" }
              } : {}}
              className="sticky top-24 bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 flex flex-col max-h-[calc(100vh-8rem)]"
            >
              <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4 flex-shrink-0">
                Your Pre-Order
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-coffee-light">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  {/* Single scrollable container for entire cart content */}
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                    {/* Cart Items */}
                    <div className="mb-3">
                      <div className="text-xs text-coffee-light/70 mb-1.5 font-semibold">Cart Items ({cart.length})</div>
                      <div className="space-y-1.5">
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

                    <div className="border-t border-coffee-brown/50 pt-3 space-y-1.5 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-coffee-light">Subtotal:</span>
                        <span className="text-coffee-cream">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {offerDiscountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-coffee-light">Daily Offer ({selectedOffer?.name}):</span>
                          <span className="text-green-400">-₹{offerDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {offerDiscountAmount > 0 && (
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
                    {/* Auto-applied Daily Offer Info */}
                    {selectedOffer && (
                      <div className="mb-4 p-3 bg-coffee-amber/10 border border-coffee-amber/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-coffee-amber">✨ Daily Offer Applied</span>
                        </div>
                        <div className="text-xs text-coffee-light">
                          <div className="font-semibold text-coffee-cream">{selectedOffer.name}</div>
                          {selectedOffer.description && (
                            <div className="mt-1">{selectedOffer.description}</div>
                          )}
                          <div className="mt-1 text-coffee-amber">
                            {selectedOffer.offerType === 'percentage'
                              ? `${selectedOffer.discountValue}% OFF`
                              : `₹${selectedOffer.discountValue} OFF`}
                          </div>
                        </div>
                      </div>
                    )}

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
                            className={`w-full bg-coffee-brown/40 border ${mobileError ? 'border-red-500' : 'border-coffee-brown'
                              } text-coffee-cream rounded-lg px-3 py-2 text-sm`}
                            maxLength={13}
                          />
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
                          className={`w-full bg-coffee-brown/40 border ${nameError ? 'border-red-500' : 'border-coffee-brown'
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
                            className={`flex-1 bg-coffee-brown/40 border ${emailError ? 'border-red-500' : emailVerified ? 'border-green-500' : 'border-coffee-brown'
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
            </motion.div>
          </div>
        </div >
      </div >


      {/* Login Modal */}
      < CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          // Navigate back to coffee menu page if user closes without logging in
          if (!isCustomerLoggedIn()) {
            navigate('/coffee');
          }
        }}
        onSuccess={handleLoginSuccess}
        requireName={false}
        title="Login to Pre-Order"
      />

      {/* OTP Modal */}
      < OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={customerEmail}
        onVerify={verifyOTP}
        type="customer-email"
      />

      {/* Animated Discovery Sidebar */}
      < AnimatePresence >
        {isDiscoveryOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsDiscoveryOpen(false)}
              className="fixed inset-0 bg-coffee-darkest/80 backdrop-blur-sm z-50"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px] bg-coffee-darkest z-50 shadow-2xl overflow-y-auto"
              style={{ boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)' }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-coffee-darkest border-b border-coffee-amber/20 p-4 md:p-6 flex items-center justify-between z-10 backdrop-blur-sm">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-coffee-amber flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Coffee Discovery
                </h2>
                <button
                  onClick={() => setIsDiscoveryOpen(false)}
                  className="p-2 rounded-full hover:bg-coffee-brown/30 text-coffee-light hover:text-coffee-amber transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                <CoffeeDiscovery />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >

      {/* Floating Cart Button for Mobile */}
      {
        cart.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowMobileCart(true)}
            className="lg:hidden fixed bottom-24 right-4 z-40 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-full p-4 shadow-2xl hover:shadow-coffee-amber/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            style={{ boxShadow: '0 10px 40px rgba(255, 140, 0, 0.4)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cart.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </motion.span>
            )}
          </motion.button>
        )
      }

      {/* Mobile Cart Drawer - Note: PreOrder has different structure, so we'll show a simplified version */}
      <AnimatePresence>
        {showMobileCart && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileCart(false)}
              className="lg:hidden fixed inset-0 bg-coffee-darkest/80 backdrop-blur-sm z-50"
            />

            {/* Cart Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-coffee-darkest z-50 shadow-2xl rounded-t-3xl max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-coffee-darker border-b border-coffee-brown/30 p-4 flex items-center justify-between z-10 rounded-t-3xl">
                <h2 className="text-xl font-heading font-bold text-coffee-amber flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Your Pre-Order ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </h2>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="p-2 rounded-full hover:bg-coffee-brown/30 text-coffee-light hover:text-coffee-amber transition-colors duration-200"
                  aria-label="Close cart"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-coffee-light">
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items */}
                    <div>
                      <div className="text-sm text-coffee-light/70 mb-3 font-semibold">Cart Items</div>
                      <div className="space-y-2">
                        {cart.map((item, idx) => (
                          <div key={idx} className="bg-coffee-brown/40 rounded-lg p-3 border border-coffee-brown/30">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-sm font-semibold text-coffee-cream">{item.name}</p>
                                {item.priceType !== 'Standard' && (
                                  <p className="text-xs text-coffee-light/80">{item.priceType}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.itemId, item.priceType)}
                                className="text-coffee-light hover:text-red-400 flex-shrink-0 ml-2"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.priceType, -1)}
                                  className="w-7 h-7 rounded bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown text-sm flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="text-sm text-coffee-cream w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.priceType, 1)}
                                  className="w-7 h-7 rounded bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown text-sm flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-sm font-semibold text-coffee-amber">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-coffee-brown/50 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-coffee-light">Subtotal:</span>
                        <span className="text-coffee-cream">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {offerDiscountAmount > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-coffee-light">Daily Offer ({selectedOffer?.name}):</span>
                            <span className="text-green-400">-₹{offerDiscountAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-1 border-t border-coffee-brown/30">
                            <span className="text-coffee-light font-semibold">Discounted Subtotal:</span>
                            <span className="text-coffee-cream font-semibold">₹{discountedSubtotal.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-coffee-light">CGST ({cgstRate.toFixed(1)}%):</span>
                        <span className="text-coffee-cream">₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-coffee-light">SGST ({sgstRate.toFixed(1)}%):</span>
                        <span className="text-coffee-cream">₹{sgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-coffee-brown/50">
                        <span className="text-coffee-amber">Total:</span>
                        <span className="text-coffee-amber">₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div className="pt-4 border-t border-coffee-brown/50">
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
                          className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2.5 text-sm"
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

                    {/* Customer Info Section */}
                    <div className="space-y-3 pt-4 border-t border-coffee-brown/50">
                      <div>
                        <input
                          type="tel"
                          placeholder="Mobile number * (10 digits)"
                          value={customerMobile}
                          onChange={(e) => {
                            setCustomerMobile(e.target.value);
                            setMobileError('');
                          }}
                          className={`w-full bg-coffee-brown/40 border ${mobileError ? 'border-red-500' : 'border-coffee-brown'
                            } text-coffee-cream rounded-lg px-3 py-2.5 text-sm`}
                          maxLength={13}
                        />
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
                          className={`w-full bg-coffee-brown/40 border ${nameError ? 'border-red-500' : 'border-coffee-brown'
                            } text-coffee-cream rounded-lg px-3 py-2.5 text-sm`}
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
                            className={`flex-1 bg-coffee-brown/40 border ${emailError ? 'border-red-500' : emailVerified ? 'border-green-500' : 'border-coffee-brown'
                              } text-coffee-cream rounded-lg px-3 py-2.5 text-sm`}
                          />
                          {!emailVerified && customerEmail && (
                            <button
                              onClick={sendOTP}
                              className="px-4 py-2.5 bg-coffee-amber text-coffee-darker rounded-lg text-xs font-semibold hover:bg-coffee-gold whitespace-nowrap"
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
                        className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Button at Bottom */}
              {cart.length > 0 && (
                <div className="sticky bottom-0 bg-coffee-darker border-t border-coffee-brown/50 p-4 pt-4">
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker py-3.5 rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg text-base"
                  >
                    Place Pre-Order & Pay
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Chatbot onOpenChange={setIsChatbotOpen} />
      {!isChatbotOpen && <DailyOffersPopup />}
    </div >
  );
};

export default PreOrder;

