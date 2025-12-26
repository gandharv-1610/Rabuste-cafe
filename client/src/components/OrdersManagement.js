import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ReceiptModal from './ReceiptModal';

const OrdersManagement = ({ soundEnabled, onSoundToggle }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Play sound when new order arrives
    if (orders.length > 0 && orders.length > lastOrderCount && soundEnabled) {
      playOrderSound();
    }
    setLastOrderCount(orders.length);
  }, [orders.length, soundEnabled, lastOrderCount]);

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

  return (
    <div>
      {/* Sound Control */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Orders Management</h2>
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


      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-coffee-brown/20 rounded-lg">
          <p className="text-coffee-light text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-coffee-light">
                    <p>Table: <span className="font-semibold text-coffee-cream">{order.tableNumber}</span></p>
                    <p>Time: {formatDate(order.createdAt)}</p>
                    {order.estimatedPrepTime > 0 && (
                      <p>Est. Prep: <span className="text-coffee-amber">{order.estimatedPrepTime} min</span></p>
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

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-coffee-brown/50">
                {order.status === 'Pending' && (
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
                    onClick={() => updateOrderStatus(order._id, 'Cancelled')}
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

