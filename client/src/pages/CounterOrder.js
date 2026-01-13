import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ReceiptModal from '../components/ReceiptModal';
import CoffeeLoader from '../components/CoffeeLoader';

const CounterOrder = () => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [nameError, setNameError] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false); // Marketing email consent
  const [billingSettings, setBillingSettings] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());
  const [cartShake, setCartShake] = useState(0);
  const cartRef = useRef(null);

  useEffect(() => {
    fetchMenuItems();
    fetchBillingSettings();
    fetchOffers();
  }, []);

  // Fetch billing settings and offers
  const fetchBillingSettings = async () => {
    try {
      const response = await api.get('/billing/settings');
      setBillingSettings(response.data);
    } catch (error) {
      console.error('Error fetching billing settings:', error);
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

  // Check if an offer is applicable to current cart
  const isOfferApplicable = useCallback((offer) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    if (offer.minOrderAmount && subtotal < offer.minOrderAmount) {
      return false;
    }
    
    if (offer.applicableCategories && offer.applicableCategories.length > 0) {
      const itemCategories = cart.map(item => item.category || 'Coffee');
      const hasMatchingCategory = itemCategories.some(cat => offer.applicableCategories.includes(cat));
      if (!hasMatchingCategory) return false;
    }
    
    if (offer.applicableItems && offer.applicableItems.length > 0) {
      const itemIds = cart.map(item => item.itemId?.toString());
      const hasMatchingItem = offer.applicableItems.some(offerItemId => 
        itemIds.includes(offerItemId.toString())
      );
      if (!hasMatchingItem) return false;
    }
    
    return true;
  }, [cart]);

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

  // Validate mobile number
  const validateMobile = (mobile) => {
    const cleaned = mobile.replace(/[\s-]/g, '');
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  };

  // Lookup customer by mobile
  const handleMobileLookup = async () => {
    if (!customerMobile || !customerMobile.trim()) {
      setMobileError('Please enter mobile number');
      return;
    }

    if (!validateMobile(customerMobile)) {
      setMobileError('Please enter a valid Indian mobile number (10 digits)');
      return;
    }

    setIsLookingUpCustomer(true);
    setMobileError('');

    try {
      const response = await api.get(`/customers/lookup/${customerMobile.trim()}`);

      const { customer, exists } = response.data;

      if (exists && customer) {
        // Existing customer - auto-populate name and email
        setCustomerExists(true);
        setCustomerName(customer.name || '');
        setCustomerEmail(customer.email || customerEmail);
        setNameError('');
      } else {
        // New customer - name is required
        setCustomerExists(false);
        setCustomerName('');
        setCustomerEmail('');
        setNameError('Please enter customer name');
      }
    } catch (error) {
      console.error('Customer lookup error:', error);
      setMobileError(error.response?.data?.message || 'Failed to lookup customer');
    } finally {
      setIsLookingUpCustomer(false);
    }
  };

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

  // Place order (Counter - no payment needed)
  const handlePlaceOrder = async () => {
    // Reset errors
    setMobileError('');
    setNameError('');

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Validate required fields
    if (!customerMobile || !customerMobile.trim()) {
      setMobileError('Mobile number is required');
      return;
    }

    if (!validateMobile(customerMobile)) {
      setMobileError('Please enter a valid Indian mobile number (10 digits)');
      return;
    }

    if (!customerName || !customerName.trim()) {
      setNameError('Name is required');
      return;
    }

    if (customerName.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          priceType: item.priceType
        })),
        customerMobile: customerMobile.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : '',
        notes: notes || '',
        appliedOfferId: selectedOffer?._id || null,
        orderSource: 'Counter',
        marketingConsent: marketingConsent // Marketing email consent
      };

      const response = await api.post('/orders', orderData);
      setOrderPlaced(response.data);
      setCart([]);
      setShowReceipt(true);
      
      // Reset form but keep mobile for next order
      setCustomerName('');
      setCustomerEmail('');
      setNotes('');
      setCustomerExists(false);
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order.';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const categories = ['All', 'Coffee', 'Shakes', 'Sides', 'Tea'];
  const { subtotal, offerDiscountAmount, discountedSubtotal, cgstRate, sgstRate, cgstAmount, sgstAmount, tax, total } = calculateTotals();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <CoffeeLoader size="lg" />
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
                Counter Order
              </h1>
              <p className="text-coffee-light">Salesperson Order Entry</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold"
            >
              Back to Admin
            </button>
          </div>
        </div>
      </section>

      {/* Order Placed Success */}
      {orderPlaced && showReceipt && (
        <ReceiptModal
          order={orderPlaced}
          onClose={() => {
            setShowReceipt(false);
            setOrderPlaced(null);
            // Keep mobile for next order, reset others
            setCustomerName('');
            setCustomerEmail('');
            setNotes('');
            setCustomerExists(false);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
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
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredItems.map(item => {
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
                        <h3 className="text-lg font-heading font-bold text-coffee-amber mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-coffee-light mb-3 line-clamp-2">
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
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                recentlyAdded.has(`${item._id}-Blend`)
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
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                recentlyAdded.has(`${item._id}-Robusta Special`)
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
                              className={`w-full px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                recentlyAdded.has(`${item._id}-Standard`)
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
              className="sticky top-24 bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden"
            >
              <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
                Order
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-coffee-light">
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  {/* Single scrollable container for entire cart content */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
                    {/* Cart Items */}
                    <div className="mb-3">
                      <div className="text-xs text-coffee-light/70 mb-1.5 font-semibold">Cart Items ({cart.length})</div>
                      <div className="space-y-3">
                        {cart.map((item, idx) => (
                          <div key={idx} className="bg-coffee-brown/40 rounded p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-coffee-cream">{item.name}</p>
                                {item.priceType !== 'Standard' && (
                                  <p className="text-xs text-coffee-light">{item.priceType}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.itemId, item.priceType)}
                                className="text-coffee-light hover:text-coffee-amber"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.priceType, -1)}
                                  className="w-6 h-6 rounded bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown"
                                >
                                  -
                                </button>
                                <span className="text-sm text-coffee-cream w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.priceType, 1)}
                                  className="w-6 h-6 rounded bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown"
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

                    <div className="border-t border-coffee-brown/50 pt-4 space-y-2 mb-4">
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

                    {/* Customer Info */}
                    <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex gap-2 mb-1">
                        <input
                          type="tel"
                          placeholder="Mobile number *"
                          value={customerMobile}
                          onChange={(e) => {
                            setCustomerMobile(e.target.value);
                            setMobileError('');
                            setCustomerExists(false);
                            setCustomerName('');
                          }}
                          className={`flex-1 bg-coffee-brown/40 border ${
                            mobileError ? 'border-red-500' : 'border-coffee-brown'
                          } text-coffee-cream rounded-lg px-3 py-2 text-sm`}
                          maxLength={13}
                        />
                        <button
                          onClick={handleMobileLookup}
                          disabled={isLookingUpCustomer || !customerMobile.trim()}
                          className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg text-sm font-semibold hover:bg-coffee-gold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLookingUpCustomer ? '...' : 'Lookup'}
                        </button>
                      </div>
                      {mobileError && (
                        <p className="text-red-400 text-xs">{mobileError}</p>
                      )}
                      {customerExists && (
                        <p className="text-green-400 text-xs">✓ Customer found</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder={customerExists ? "Customer name * (auto-filled)" : "Customer name *"}
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setNameError('');
                        }}
                        className={`w-full bg-coffee-brown/40 border ${
                          nameError ? 'border-red-500' : 'border-coffee-brown'
                        } text-coffee-cream rounded-lg px-3 py-2 text-sm`}
                        disabled={customerExists && customerName}
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
                      placeholder="Notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                      className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                    />
                    {/* Marketing Consent Checkbox */}
                    <div className="mt-3">
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
                  </div>

                  {/* Fixed Button at Bottom */}
                  <div className="flex-shrink-0 pt-4 border-t border-coffee-brown/50 mt-auto">
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker py-3 rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg"
                    >
                      Complete Order (Cash)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CounterOrder;

