import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';
import ReceiptModal from '../components/ReceiptModal';

const Order = () => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('rabuste_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

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

  // Save favorites to localStorage
  const saveFavorites = (newFavorites) => {
    localStorage.setItem('rabuste_favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  // Toggle favorite
  const toggleFavorite = (itemId) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    saveFavorites(newFavorites);
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
      prepTime: item.prepTime || 5
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

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + tax;
    const estimatedPrepTime = cart.length > 0
      ? Math.max(...cart.map(item => item.prepTime)) + Math.ceil(cart.reduce((sum, item) => sum + item.quantity, 0) / 3)
      : 0;
    
    return { subtotal, tax, total, estimatedPrepTime };
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

  // Place order and initiate payment
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Validate cart items have valid prices
    const invalidItems = cart.filter(item => !item.itemId || item.price <= 0 || item.quantity <= 0);
    if (invalidItems.length > 0) {
      alert('Some items in your cart have invalid prices or quantities. Please remove them and try again.');
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
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        notes: notes || '',
        orderSource: 'QR'
      };

      console.log('Placing order with data:', orderData);

      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;

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
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support with your order number.');
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
          ondismiss: function() {
            alert('Payment cancelled. Your order has been created but payment is pending.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Favorites') return favorites.includes(item._id);
    return item.category === selectedCategory;
  });

  const categories = ['All', 'Coffee', 'Shakes', 'Sides', 'Tea', 'Favorites'];
  const { subtotal, tax, total, estimatedPrepTime } = calculateTotals();

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
                Place Your Order
              </h1>
              <p className="text-coffee-light">
                Scan QR code to order • Payment required
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold"
            >
              Go Home
            </button>
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
                  {cat === 'Favorites' ? `⭐ ${cat}` : cat}
                </button>
              ))}
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
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-coffee-light">⏱️ {item.prepTime || 5} min</span>
                          </div>
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
            <div className="sticky top-24 bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50">
              <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
                Your Order
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-coffee-light">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
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

                  <div className="border-t border-coffee-brown/50 pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-coffee-light">Subtotal:</span>
                      <span className="text-coffee-cream">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-coffee-light">Tax (5%):</span>
                      <span className="text-coffee-cream">₹{tax.toFixed(2)}</span>
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

                  {/* Customer Info */}
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2 text-sm"
                    />
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

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker py-3 rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default Order;

