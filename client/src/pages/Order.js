import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import CoffeeDiscovery from '../components/CoffeeDiscovery';
import ReceiptModal from '../components/ReceiptModal';
import CustomerLoginModal from '../components/CustomerLoginModal';
import DailyOffersPopup from '../components/DailyOffersPopup';
import CoffeeLoader from '../components/CoffeeLoader';
import {
  getCustomerSession,
  setCustomerSession,
  isCustomerLoggedIn,
  getCustomerMobile
} from '../utils/customerAuth';

const Order = () => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [temperatureFilter, setTemperatureFilter] = useState('All'); // All, Hot, Cold
  const [milkFilter, setMilkFilter] = useState('All'); // All, Milk, Non-Milk
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
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForFavorite, setLoginForFavorite] = useState(null); // itemId to favorite after login
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'counter'
  const [marketingConsent, setMarketingConsent] = useState(false); // Marketing email consent
  const [billingSettings, setBillingSettings] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(new Set()); // Track items just added
  const [cartShake, setCartShake] = useState(0); // For cart shake animation
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false); // AI Discovery modal state
  const [showDiscoveryBanner, setShowDiscoveryBanner] = useState(true); // Show promotional banner
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // Chatbot open state
  const [showMobileCart, setShowMobileCart] = useState(false); // Mobile cart drawer state
  const cartRef = useRef(null);

  // Load customer session and favorites on mount
  useEffect(() => {
    const session = getCustomerSession();
    if (session) {
      // Pre-fill customer info from session
      setCustomerMobile(session.mobile || '');
      setCustomerName(session.name || '');
      setCustomerEmail(session.email || '');

      // Load favorites from server
      loadFavoritesFromServer(session.mobile);
    } else {
      // Show login modal when user visits order page without being logged in
      setShowLoginModal(true);
    }
  }, []);

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
      // Fallback to localStorage if server fails
      const savedFavorites = localStorage.getItem('rabuste_favorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error('Error loading favorites from localStorage:', e);
        }
      }
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

  // Toggle favorite
  const toggleFavorite = async (itemId, skipLoginCheck = false) => {
    // Check if user is logged in (unless skipLoginCheck is true)
    if (!skipLoginCheck && !isCustomerLoggedIn()) {
      // Prompt login for favorites
      setLoginForFavorite(itemId);
      setShowLoginModal(true);
      return;
    }

    const isFavorite = favorites.includes(itemId);
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];

    const customerMobile = getCustomerMobile();

    // Update local state immediately
    setFavorites(newFavorites);
    localStorage.setItem('rabuste_favorites', JSON.stringify(newFavorites));

    // Update server
    if (customerMobile) {
      try {
        await api.post(`/customers/${customerMobile}/favorites`, {
          itemId,
          action: isFavorite ? 'remove' : 'add'
        });
      } catch (error) {
        console.error('Error updating favorite:', error);
        // Revert local state on error
        setFavorites(favorites);
        localStorage.setItem('rabuste_favorites', JSON.stringify(favorites));
      }
    }
  };

  // Handle login success
  const handleLoginSuccess = async (customer) => {
    // Update session
    setCustomerSession(customer);

    // Pre-fill customer info
    setCustomerMobile(customer.mobile || '');
    setCustomerName(customer.name || '');
    setCustomerEmail(customer.email || '');

    // Load favorites from server
    if (customer.mobile) {
      await loadFavoritesFromServer(customer.mobile);
    }

    // If login was triggered by favorite action, complete it
    if (loginForFavorite) {
      const itemId = loginForFavorite;
      setLoginForFavorite(null);
      // Toggle favorite after login (skip login check since we just logged in)
      setTimeout(() => {
        toggleFavorite(itemId, true);
      }, 100);
    }

    setShowLoginModal(false);
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

    const estimatedPrepTime = cart.length > 0
      ? Math.max(...cart.map(item => item.prepTime)) + Math.ceil(cart.reduce((sum, item) => sum + item.quantity, 0) / 3)
      : 0;

    return {
      subtotal,
      offerDiscountAmount,
      discountedSubtotal,
      cgstRate,
      sgstRate,
      cgstAmount,
      sgstAmount,
      tax,
      total,
      estimatedPrepTime
    };
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Validate mobile number
  const validateMobile = (mobile) => {
    const cleaned = mobile.replace(/[\s-]/g, '');
    // Indian mobile: 10 digits starting with 6-9, optionally with +91 or 91
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  };

  // Debounce customer lookup and auto-populate details
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const phone = customerMobile;
      if (!phone || phone.trim().length < 10) {
        return;
      }

      // Only search if we have at least 10 digits
      const cleaned = phone.replace(/[\s-]/g, '');
      if (cleaned.length < 10) {
        return;
      }

      setIsLoadingCustomer(true);
      try {
        const response = await api.get(`/customers/lookup/${phone}`);
        if (response.data.exists && response.data.customer) {
          const customer = response.data.customer;
          // Auto-populate customer details only if fields are empty or match previous customer
          // This prevents overwriting user's manual input
          if (!customerName || customerName === customer.name) {
            setCustomerName(customer.name || '');
          }
          if (!customerEmail || customerEmail === customer.email) {
            setCustomerEmail(customer.email || '');
          }
          console.log('Customer details auto-populated:', customer.name);
        }
      } catch (error) {
        // Silently fail - don't show error for lookup failures
        console.log('Customer lookup failed (not found or invalid):', error.message);
      } finally {
        setIsLoadingCustomer(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerMobile]);

  // Place order and initiate payment
  const handlePlaceOrder = async () => {
    // Reset errors
    setMobileError('');
    setNameError('');

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check if user is logged in
    const session = getCustomerSession();
    let finalMobile = customerMobile.trim();
    let finalName = customerName.trim();
    let finalEmail = customerEmail.trim();

    // If logged in, use session data
    if (session) {
      finalMobile = session.mobile || finalMobile;
      finalName = session.name || finalName;
      finalEmail = session.email || finalEmail;

      // Update form fields to match session
      setCustomerMobile(finalMobile);
      setCustomerName(finalName);
      setCustomerEmail(finalEmail);
    }

    // Validate required fields
    if (!finalMobile || !finalMobile.trim()) {
      setMobileError('Mobile number is required');
      return;
    }

    if (!validateMobile(finalMobile)) {
      setMobileError('Please enter a valid Indian mobile number (10 digits)');
      return;
    }

    // Check if customer exists - if yes, only phone needed; if no, name also needed
    if (!session) {
      try {
        const lookupResponse = await api.get(`/customers/lookup/${finalMobile}`);
        if (lookupResponse.data.exists && lookupResponse.data.customer) {
          // Existing customer - only phone needed, auto-fill name
          const customer = lookupResponse.data.customer;
          finalName = customer.name;
          finalEmail = customer.email || finalEmail;
          setCustomerName(finalName);
          setCustomerEmail(finalEmail);

          // Auto-login the user
          setCustomerSession(customer);
        } else {
          // New customer - name required
          if (!finalName || !finalName.trim()) {
            setNameError('Name is required for new customers');
            return;
          }
        }
      } catch (error) {
        // If lookup fails, require name
        if (!finalName || !finalName.trim()) {
          setNameError('Name is required');
          return;
        }
      }
    }

    if (!finalName || !finalName.trim()) {
      setNameError('Name is required');
      return;
    }

    if (finalName.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }

    // Validate cart items have valid prices
    const invalidItems = cart.filter(item => !item.itemId || item.price <= 0 || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast.error('Some items in your cart have invalid prices or quantities. Please remove them and try again.');
      return;
    }

    try {
      const { total } = calculateTotals();

      // Create order first
      const orderData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          priceType: item.priceType
        })),
        customerMobile: finalMobile,
        customerName: finalName,
        customerEmail: finalEmail || '',
        notes: notes || '',
        appliedOfferId: selectedOffer?._id || null,
        orderSource: 'QR',
        paymentMethod: paymentMethod, // 'online' or 'counter'
        marketingConsent: marketingConsent // Marketing email consent
      };

      console.log('Placing order with data:', orderData);

      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;

      // Handle payment based on selected method
      if (paymentMethod === 'counter') {
        // Pay at Counter - order is created with pending payment
        // It will appear in admin panel for confirmation
        setOrderPlaced(order);
        setCart([]);
        setShowReceipt(true);
      } else {
        // Pay Online - proceed with Razorpay
        // Create Razorpay payment order
        const paymentResponse = await api.post('/payment/create-order', {
          amount: total,
          orderId: order._id,
          customerName: customerName || '',
          customerEmail: customerEmail || ''
        });

        // Initialize Razorpay checkout
        const options = {
          key: paymentResponse.data.key,
          amount: paymentResponse.data.amount,
          currency: paymentResponse.data.currency,
          name: 'Rabuste Coffee',
          description: `Order #${order.orderNumber}`,
          order_id: paymentResponse.data.id,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await api.post('/payment/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id
              });

              if (verifyResponse.data.success) {
                // Fetch updated order
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
            name: customerName || '',
            email: customerEmail || ''
          },
          theme: {
            color: '#FF8C00'
          },
          modal: {
            ondismiss: function () {
              toast.warning('Payment cancelled. Your order has been created but payment is pending.');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
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
      // Category filter
      if (selectedCategory === 'All') {
        return true;
      }
      if (selectedCategory === 'Favorites') {
        return favorites.includes(item._id);
      }
      if (item.category !== selectedCategory) return false;

      // Apply temperature and milk filters only when Coffee category is selected
      if (selectedCategory === 'Coffee' && item.category === 'Coffee') {
        if (temperatureFilter !== 'All' && item.subcategory !== temperatureFilter) {
          return false;
        }
        if (milkFilter !== 'All' && item.milkType !== milkFilter) {
          return false;
        }
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
  const { subtotal, offerDiscountAmount, discountedSubtotal, cgstRate, sgstRate, cgstAmount, sgstAmount, tax, total, estimatedPrepTime } = calculateTotals();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <CoffeeLoader size="lg" />
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
                Place Your Order
              </h1>
              <p className="text-coffee-light">
                Scan QR code to order • Payment required
              </p>
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
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold text-sm sm:text-base w-full sm:w-auto"
              >
                Go Home
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
          {/* Menu Section */}
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

            {/* Menu Grid */}
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

                        {/* Strength and Flavor Notes for Coffee */}
                        {isCoffee && (
                          <div className="mb-3 space-y-1.5">
                            {item.strength && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-coffee-light/70">Strength:</span>
                                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${item.strength === 'Mild' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  item.strength === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                    item.strength === 'Strong' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                      'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                  {item.strength}
                                </span>
                              </div>
                            )}
                            {item.flavorNotes && item.flavorNotes.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-coffee-light/70">Flavor Notes:</span>
                                <div className="flex flex-wrap gap-1">
                                  {item.flavorNotes.map((note, noteIdx) => (
                                    <span key={noteIdx} className="text-xs px-2 py-0.5 bg-coffee-amber/20 text-coffee-amber rounded border border-coffee-amber/30">
                                      {note}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

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
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-coffee-light">⏱️ {item.prepTime || 5} min</span>
                          </div>
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
                Your Order
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
                      {estimatedPrepTime > 0 && (
                        <div className="flex items-center gap-2 text-sm text-coffee-light pt-2">
                          <span>⏱️ Est. Prep Time:</span>
                          <span className="font-semibold text-coffee-amber">{estimatedPrepTime} min</span>
                        </div>
                      )}
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
                        {customerMobile.length >= 10 && customerName && !isLoadingCustomer && (
                          <p className="text-green-400 text-xs mt-1">✓ Customer details loaded</p>
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
                      <input
                        type="email"
                        placeholder="Email for receipt (optional)"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                      />
                      <textarea
                        placeholder="Special instructions (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="2"
                        className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-coffee-amber mb-2">
                        Payment Method *
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('online')}
                          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${paymentMethod === 'online'
                            ? 'bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker shadow-lg'
                            : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
                            }`}
                        >
                          💳 Pay Online
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('counter')}
                          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${paymentMethod === 'counter'
                            ? 'bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker shadow-lg'
                            : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
                            }`}
                        >
                          🏪 Pay at Counter
                        </button>
                      </div>
                      <p className="text-xs text-coffee-light/70 mt-2">
                        {paymentMethod === 'counter'
                          ? 'Order will be confirmed after payment at counter'
                          : 'Secure online payment via Razorpay'}
                      </p>
                    </div>

                    {/* Marketing Consent Checkbox */}
                    <div className="mb-4">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="mt-1 w-4 h-4 text-coffee-amber bg-coffee-brown/40 border-coffee-brown rounded focus:ring-coffee-amber"
                        />
                        <span className="text-sm text-coffee-light">
                          I would like to receive email updates about new coffees, offers, and workshops from Rabuste Coffee.
                        </span>
                      </label>
                      <p className="text-xs text-coffee-light/60 mt-1 ml-6">
                        You can unsubscribe at any time. We respect your privacy.
                      </p>
                    </div>
                  </div>

                  {/* Fixed Button at Bottom */}
                  <div className="flex-shrink-0 pt-4 border-t border-coffee-brown/50 mt-auto">
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker py-3 rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg"
                    >
                      {paymentMethod === 'counter' ? 'Place Order (Pay at Counter)' : 'Place Order & Pay'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>


      {/* Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          if (loginForFavorite) {
            setLoginForFavorite(null);
          }
        }}
        onSuccess={handleLoginSuccess}
        requireName={false}
        title={loginForFavorite ? "Login to Save Favorites" : "Login to Place Order"}
      />

      {/* Animated Discovery Sidebar */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Floating Cart Button for Mobile */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowMobileCart(true)}
          className="lg:hidden fixed bottom-40 right-4 z-50 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-full p-4 shadow-2xl hover:shadow-coffee-amber/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
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
      )}

      {/* Mobile Cart Drawer */}
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
                  Your Order ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
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
                            <span className="text-coffee-light">Daily Offer:</span>
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

                    {/* Customer Info Section */}
                    <div className="space-y-3 pt-4 border-t border-coffee-brown/50">
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
                        <p className="text-red-400 text-xs">{mobileError}</p>
                      )}
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
                        <p className="text-red-400 text-xs">{nameError}</p>
                      )}
                      <input
                        type="email"
                        placeholder="Email for receipt (optional)"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2.5 text-sm"
                      />
                      <textarea
                        placeholder="Special instructions (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="2"
                        className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2.5 text-sm"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="pt-4 border-t border-coffee-brown/50">
                      <label className="block text-sm font-semibold text-coffee-amber mb-2">
                        Payment Method *
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('online')}
                          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${paymentMethod === 'online'
                            ? 'bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker shadow-lg'
                            : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
                            }`}
                        >
                          💳 Pay Online
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('counter')}
                          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${paymentMethod === 'counter'
                            ? 'bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker shadow-lg'
                            : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
                            }`}
                        >
                          🏪 Pay at Counter
                        </button>
                      </div>
                    </div>

                    {/* Marketing Consent */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="mt-1 w-4 h-4 text-coffee-amber bg-coffee-brown/40 border-coffee-brown rounded focus:ring-coffee-amber"
                        />
                        <span className="text-xs text-coffee-light">
                          I'd like to receive updates about new coffee items, offers, and workshops
                        </span>
                      </label>
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
                    {paymentMethod === 'counter' ? 'Place Order (Pay at Counter)' : 'Place Order & Pay'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Chatbot onOpenChange={setIsChatbotOpen} />
      {!isChatbotOpen && <DailyOffersPopup />}
    </div>
  );
};

export default Order;

