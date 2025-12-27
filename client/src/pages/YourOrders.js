import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ReceiptModal from '../components/ReceiptModal';
import Chatbot from '../components/Chatbot';
import CustomerLoginModal from '../components/CustomerLoginModal';
import { 
  getCustomerSession, 
  setCustomerSession, 
  isCustomerLoggedIn,
  getCustomerMobile
} from '../utils/customerAuth';

const YourOrders = () => {
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ordersData, setOrdersData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [autoFetchAttempted, setAutoFetchAttempted] = useState(false);

  // Check for session on mount and auto-fetch orders
  useEffect(() => {
    const session = getCustomerSession();
    if (session && session.mobile) {
      setMobile(session.mobile);
      // Auto-fetch orders if logged in
      if (!autoFetchAttempted) {
        setAutoFetchAttempted(true);
        fetchOrdersByMobile(session.mobile);
      }
    } else {
      // No session - show login prompt
      setShowLoginModal(true);
    }
  }, [autoFetchAttempted]);

  // Auto-reload orders every 5 seconds if user is logged in and has orders
  useEffect(() => {
    if (!isCustomerLoggedIn() || !ordersData) return;

    const session = getCustomerSession();
    if (session && session.mobile) {
      const interval = setInterval(() => {
        fetchOrdersByMobile(session.mobile);
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [ordersData, isCustomerLoggedIn]);

  // Fetch orders by mobile
  const fetchOrdersByMobile = async (mobileNumber) => {
    if (!mobileNumber) return;
    
    setMobileError('');
    setLoading(true);
    try {
      const response = await api.get(`/customers/${mobileNumber}/orders`);
      setOrdersData(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 404) {
        setMobileError('No orders found for this mobile number');
      } else {
        setMobileError(error.response?.data?.message || 'Failed to fetch orders');
      }
      setOrdersData(null);
    } finally {
      setLoading(false);
    }
  };

  // Validate mobile number
  const validateMobile = (mobile) => {
    const cleaned = mobile.replace(/[\s-]/g, '');
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  };

  // Handle login success
  const handleLoginSuccess = async (customer) => {
    setCustomerSession(customer);
    setMobile(customer.mobile || '');
    setShowLoginModal(false);
    // Auto-fetch orders after login
    if (customer.mobile) {
      await fetchOrdersByMobile(customer.mobile);
    }
  };

  // Fetch orders by mobile (manual trigger)
  const handleFetchOrders = async () => {
    // Check if user is logged in
    if (isCustomerLoggedIn()) {
      const sessionMobile = getCustomerMobile();
      if (sessionMobile) {
        await fetchOrdersByMobile(sessionMobile);
        return;
      }
    }
    
    setMobileError('');
    
    if (!mobile || !mobile.trim()) {
      setMobileError('Please enter your mobile number');
      return;
    }

    if (!validateMobile(mobile)) {
      setMobileError('Please enter a valid Indian mobile number (10 digits)');
      return;
    }

    await fetchOrdersByMobile(mobile.trim());
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Preparing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Ready':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-coffee-brown/20 text-coffee-light border-coffee-brown/50';
    }
  };

  // Format date
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
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <section className="py-8 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-coffee-amber mb-2">
            Your Orders
          </h1>
          <p className="text-coffee-light">
            {isCustomerLoggedIn() 
              ? `Viewing orders for ${getCustomerMobile()}`
              : 'Enter your mobile number to view your order history'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mobile Input Section */}
        <div className="bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="tel"
                placeholder="Enter your mobile number (10 digits)"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setMobileError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleFetchOrders();
                  }
                }}
                className={`w-full bg-coffee-brown/40 border ${
                  mobileError ? 'border-red-500' : 'border-coffee-brown'
                } text-coffee-cream rounded-lg px-4 py-3 text-lg`}
                maxLength={13}
              />
              {mobileError && (
                <p className="text-red-400 text-sm mt-2">{mobileError}</p>
              )}
            </div>
            <button
              onClick={handleFetchOrders}
              disabled={loading || !mobile.trim()}
              className="px-6 py-3 bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker rounded-lg font-bold hover:from-coffee-gold hover:to-coffee-amber transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'View Orders'}
            </button>
          </div>
        </div>

        {/* Orders Display */}
        {ordersData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Customer Info */}
            <div className="bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50">
              <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
                {ordersData.customer.name}
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-coffee-light">Mobile:</span>
                  <span className="text-coffee-cream ml-2">{ordersData.customer.mobile}</span>
                </div>
                <div>
                  <span className="text-coffee-light">Total Orders:</span>
                  <span className="text-coffee-amber ml-2 font-bold">{ordersData.customer.totalOrders}</span>
                </div>
                <div>
                  <span className="text-coffee-light">Total Spent:</span>
                  <span className="text-coffee-amber ml-2 font-bold">₹{ordersData.customer.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Current Processing Orders */}
            {ordersData.currentProcessing.length > 0 && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
                  Current Orders
                </h2>
                <div className="space-y-4">
                  {ordersData.currentProcessing.map((order) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 hover:border-coffee-amber/50 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-heading font-bold text-coffee-amber">
                              Order #{order.orderNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {order.tokenNumber > 0 && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-coffee-amber/20 text-coffee-amber border border-coffee-amber/50">
                                Token: {order.tokenNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-coffee-light mb-2">
                            {formatDate(order.createdAt)}
                          </p>
                          {order.estimatedPrepTime > 0 && (
                            <div className="mb-2">
                              <span className="text-xs text-coffee-light">⏱️ Est. Ready Time: </span>
                              <span className="text-xs font-semibold text-coffee-amber">
                                {new Date(new Date(order.createdAt).getTime() + order.estimatedPrepTime * 60000).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} ({order.estimatedPrepTime} min)
                              </span>
                            </div>
                          )}
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-coffee-cream">
                                  {item.name} {item.priceType !== 'Standard' && `(${item.priceType})`} × {item.quantity}
                                </span>
                                <span className="text-coffee-amber font-semibold">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-coffee-light">Total</p>
                            <p className="text-2xl font-bold text-coffee-amber">₹{order.total.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowReceipt(true);
                            }}
                            className="px-4 py-2 bg-coffee-amber/20 text-coffee-amber rounded-lg text-sm font-semibold hover:bg-coffee-amber/30 transition-colors"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Orders */}
            {ordersData.pastOrders.length > 0 && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
                  Past Orders
                </h2>
                <div className="space-y-4">
                  {ordersData.pastOrders.map((order) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-coffee-brown/30 rounded-lg p-6 border border-coffee-brown/50 hover:border-coffee-amber/50 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-heading font-bold text-coffee-amber">
                              Order #{order.orderNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {order.tokenNumber > 0 && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-coffee-amber/20 text-coffee-amber border border-coffee-amber/50">
                                Token: {order.tokenNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-coffee-light mb-2">
                            {formatDate(order.createdAt)}
                            {order.completedAt && (
                              <span className="ml-2">
                                • Completed: {formatDate(order.completedAt)}
                              </span>
                            )}
                          </p>
                          {order.estimatedPrepTime > 0 && (
                            <div className="mb-2">
                              <span className="text-xs text-coffee-light">⏱️ Est. Ready Time: </span>
                              <span className="text-xs font-semibold text-coffee-amber">
                                {new Date(new Date(order.createdAt).getTime() + order.estimatedPrepTime * 60000).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} ({order.estimatedPrepTime} min)
                              </span>
                            </div>
                          )}
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-coffee-cream">
                                  {item.name} {item.priceType !== 'Standard' && `(${item.priceType})`} × {item.quantity}
                                </span>
                                <span className="text-coffee-amber font-semibold">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-coffee-light">Total</p>
                            <p className="text-2xl font-bold text-coffee-amber">₹{order.total.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowReceipt(true);
                            }}
                            className="px-4 py-2 bg-coffee-amber/20 text-coffee-amber rounded-lg text-sm font-semibold hover:bg-coffee-amber/30 transition-colors"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Orders Message */}
            {ordersData.currentProcessing.length === 0 && ordersData.pastOrders.length === 0 && (
              <div className="text-center py-12 bg-coffee-brown/20 rounded-lg">
                <p className="text-coffee-light text-lg">No orders found for this mobile number.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => {
          // Don't allow closing if not logged in - user must login to view orders
          if (isCustomerLoggedIn()) {
            setShowLoginModal(false);
          }
        }}
        onSuccess={handleLoginSuccess}
        requireName={false}
        title="Login to View Your Orders"
      />

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedOrder && showReceipt && (
          <ReceiptModal
            order={selectedOrder}
            onClose={() => {
              setShowReceipt(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
};

export default YourOrders;

