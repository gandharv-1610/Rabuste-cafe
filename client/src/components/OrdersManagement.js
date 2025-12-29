import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ReceiptModal from './ReceiptModal';

const OrdersManagement = ({ soundEnabled, onSoundToggle }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [editingPrepTime, setEditingPrepTime] = useState(null);
  const [prepTimeValue, setPrepTimeValue] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'preorder', 'incafe'
  const lastOrderIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Play sound when new order arrives
    if (orders.length > 0 && soundEnabled) {
      const currentOrderIds = new Set(orders.map(order => order._id));
      
      // Skip sound on initial load
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        lastOrderIdsRef.current = currentOrderIds;
        return;
      }
      
      // Check if there are any new orders (orders that weren't in lastOrderIds)
      const newOrderIds = Array.from(currentOrderIds).filter(id => !lastOrderIdsRef.current.has(id));
      
      if (newOrderIds.length > 0) {
        // Play sound for new orders
        console.log('🔔 New order detected! Playing sound...', newOrderIds.length, 'new order(s)');
        playOrderSound();
      }
      
      // Update lastOrderIds to track current state
      lastOrderIdsRef.current = currentOrderIds;
    } else if (orders.length > 0) {
      // Initialize on first load (even if sound is disabled)
      lastOrderIdsRef.current = new Set(orders.map(order => order._id));
      isInitialLoadRef.current = false;
    }
  }, [orders, soundEnabled]);

  // Check for pre-orders approaching pickup time (15 minutes before)
  useEffect(() => {
    if (!soundEnabled) return;

    const checkPreOrderAlerts = () => {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      orders.forEach(order => {
        if (order.isPreOrder && order.pickupTime && order.status !== 'Completed' && order.status !== 'Cancelled') {
          const pickupTime = new Date(order.pickupTime);
          const timeDiff = pickupTime.getTime() - now.getTime();
          const minutesUntilPickup = timeDiff / (1000 * 60);

          // Alert if pickup time is within 15 minutes and we haven't alerted recently
          if (minutesUntilPickup > 0 && minutesUntilPickup <= 15 && minutesUntilPickup >= 14.5) {
            console.log(`🔔 Pre-order alert! Order #${order.orderNumber} pickup in ${Math.round(minutesUntilPickup)} minutes`);
            playOrderSound();
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Pre-Order Alert`, {
                body: `Order #${order.orderNumber} pickup in ${Math.round(minutesUntilPickup)} minutes`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    };

    // Check every 30 seconds
    const interval = setInterval(checkPreOrderAlerts, 30000);
    checkPreOrderAlerts(); // Check immediately

    return () => clearInterval(interval);
  }, [orders, soundEnabled]);

  // Create a simple beep sound using Web Audio API
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800 Hz tone
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('Audio not supported:', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const playOrderSound = () => {
    playBeep();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // Accept pre-order
  const acceptPreOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/accept-preorder`);
      fetchOrders();
      alert('Pre-order accepted! Customer has been notified.');
    } catch (error) {
      console.error('Error accepting pre-order:', error);
      alert(error.response?.data?.message || 'Failed to accept pre-order');
    }
  };

  const updateEstimatedPrepTime = async (orderId, minutes) => {
    try {
      await api.put(`/orders/${orderId}/estimated-prep-time`, { estimatedPrepTime: parseInt(minutes) });
      setEditingPrepTime(null);
      setPrepTimeValue('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating estimated prep time:', error);
      alert('Failed to update estimated prep time');
    }
  };

  const handleEditPrepTime = (order) => {
    setEditingPrepTime(order._id);
    setPrepTimeValue(order.estimatedPrepTime || '');
  };

  const viewReceipt = async (order) => {
    try {
      const response = await api.get(`/orders/${order._id}/receipt`);
      setSelectedOrder(response.data);
      setShowReceipt(true);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      alert('Failed to load receipt');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Preparing': return 'bg-blue-500/20 text-blue-400';
      case 'Ready': return 'bg-green-500/20 text-green-400';
      case 'Completed': return 'bg-gray-500/20 text-gray-400';
      case 'Cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-coffee-brown/20 text-coffee-light';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return <div className="text-coffee-light">Loading orders...</div>;
  }

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (filterType === 'preorder') {
      return order.isPreOrder === true;
    } else if (filterType === 'incafe') {
      return order.isPreOrder === false || order.orderSource === 'Counter' || order.orderSource === 'QR';
    }
    return true; // 'all'
  });

  return (
    <div>
      {/* Sound Control and Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Orders Management</h2>
        <div className="flex gap-2 items-center">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-coffee-amber text-coffee-darker'
                  : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('preorder')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'preorder'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
              }`}
            >
              📅 Preorder
            </button>
            <button
              onClick={() => setFilterType('incafe')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'incafe'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
              }`}
            >
              ☕ In Cafe
            </button>
          </div>
          <button
            onClick={onSoundToggle}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              soundEnabled
                ? 'bg-coffee-amber text-coffee-darker hover:bg-coffee-gold'
                : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
            }`}
          >
            {soundEnabled ? '🔔 Sound On' : '🔕 Sound Off'}
          </button>
        </div>
      </div>


      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-coffee-brown/20 rounded-lg">
          <p className="text-coffee-light text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-heading font-bold text-coffee-amber">
                      Order #{order.orderNumber}
                    </h3>
                    {order.isPreOrder && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/50">
                        📅 Pre-Order
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-coffee-light">
                    {order.isPreOrder && order.pickupTimeSlot && (
                      <p className="text-purple-400 font-semibold">
                        📅 Pickup: {order.pickupTimeSlot}
                        {order.pickupTime && (() => {
                          const pickupTime = new Date(order.pickupTime);
                          const now = new Date();
                          const minutesUntil = Math.round((pickupTime.getTime() - now.getTime()) / (1000 * 60));
                          if (minutesUntil > 0 && minutesUntil <= 15) {
                            return <span className="text-red-400 ml-2">⚠️ {minutesUntil} min</span>;
                          }
                          return null;
                        })()}
                      </p>
                    )}
                    {!order.isPreOrder && (
                      <p>Table: <span className="font-semibold text-coffee-cream">{order.tableNumber || 'N/A'}</span></p>
                    )}
                    <p>Time: {formatDate(order.createdAt)}</p>
                    {editingPrepTime === order._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={prepTimeValue}
                          onChange={(e) => setPrepTimeValue(e.target.value)}
                          className="w-20 px-2 py-1 bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded text-sm"
                          placeholder="Minutes"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateEstimatedPrepTime(order._id, prepTimeValue);
                            } else if (e.key === 'Escape') {
                              setEditingPrepTime(null);
                              setPrepTimeValue('');
                            }
                          }}
                        />
                        <button
                          onClick={() => updateEstimatedPrepTime(order._id, prepTimeValue)}
                          className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold hover:bg-green-500/30"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingPrepTime(null);
                            setPrepTimeValue('');
                          }}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold hover:bg-red-500/30"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p>
                          Est. Prep: <span className="text-coffee-amber">{order.estimatedPrepTime || 0} min</span>
                        </p>
                        <button
                          onClick={() => handleEditPrepTime(order)}
                          className="px-2 py-1 bg-coffee-amber/20 text-coffee-amber rounded text-xs font-semibold hover:bg-coffee-amber/30"
                          title="Edit estimated prep time"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-coffee-amber mb-2">
                    ₹{order.total.toFixed(2)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => viewReceipt(order)}
                      className="px-3 py-1 bg-coffee-amber/20 text-coffee-amber rounded text-sm font-semibold hover:bg-coffee-amber/30"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-coffee-amber mb-2">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-coffee-light">
                      <span>
                        {item.name} {item.priceType !== 'Standard' && `(${item.priceType})`} x {item.quantity}
                      </span>
                      <span className="text-coffee-cream">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Status for Counter Orders */}
              {order.paymentStatus === 'Pending' && order.paymentMethod === 'Cash' && (
                <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-400 font-semibold text-sm mb-2">⚠️ Payment Pending - Pay at Counter</p>
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/orders/${order._id}/confirm-payment`);
                        fetchOrders();
                      } catch (error) {
                        console.error('Error confirming payment:', error);
                        alert('Failed to confirm payment');
                      }
                    }}
                    className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold hover:bg-green-500/30 border border-green-500/50"
                  >
                    ✓ Confirm Payment Received
                  </button>
                </div>
              )}

              {/* Pre-Order Accept Action */}
              {order.isPreOrder && order.status === 'Pending' && order.paymentStatus === 'Paid' && (
                <div className="mb-3 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                  <p className="text-purple-400 font-semibold text-sm mb-2">📅 Pre-Order - Action Required</p>
                  <button
                    onClick={() => acceptPreOrder(order._id)}
                    className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold hover:bg-green-500/30 border border-green-500/50"
                  >
                    ✓ Accept Pre-Order
                  </button>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-coffee-brown/50">
                {order.status === 'Pending' && order.paymentStatus === 'Paid' && !order.isPreOrder && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'Preparing')}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-semibold hover:bg-blue-500/30"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'Preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'Ready')}
                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold hover:bg-green-500/30"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'Ready' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'Completed')}
                    className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg font-semibold hover:bg-gray-500/30"
                  >
                    Complete Order
                  </button>
                )}
                {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                  <button
                    onClick={async () => {
                      if (order.isPreOrder) {
                        // Use cancel-preorder endpoint for preorders (sends email)
                        try {
                          const response = await api.put(`/orders/${order._id}/cancel-preorder`);
                          alert(response.data.message || 'Pre-order cancelled successfully');
                          fetchOrders();
                        } catch (error) {
                          console.error('Error cancelling pre-order:', error);
                          alert(error.response?.data?.message || 'Failed to cancel pre-order');
                        }
                      } else {
                        // Regular cancel for non-preorders
                        updateOrderStatus(order._id, 'Cancelled');
                      }
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => {
            setShowReceipt(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrdersManagement;

