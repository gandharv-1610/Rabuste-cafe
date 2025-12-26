import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const OrderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await api.get(`/admin/orders/analytics?${params}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-coffee-brown/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-coffee-light">No analytics data available</div>;
  }

  const ordersPerHourData = analytics.ordersPerHour.map(item => ({
    hour: `${item.hour}:00`,
    orders: item.count,
    revenue: item.totalRevenue
  }));

  const mostOrderedData = analytics.mostOrderedItems.slice(0, 5).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    quantity: item.totalQuantity,
    revenue: item.totalRevenue
  }));

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm text-coffee-amber mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-coffee-amber mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-coffee-brown/40 to-coffee-dark/40 rounded-lg p-6 border border-coffee-brown/50"
        >
          <p className="text-sm text-coffee-light mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-coffee-amber">{analytics.totalOrders}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-coffee-brown/40 to-coffee-dark/40 rounded-lg p-6 border border-coffee-brown/50"
        >
          <p className="text-sm text-coffee-light mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-coffee-amber">₹{analytics.totalRevenue.total.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-coffee-brown/40 to-coffee-dark/40 rounded-lg p-6 border border-coffee-brown/50"
        >
          <p className="text-sm text-coffee-light mb-1">Avg Prep Time</p>
          <p className="text-3xl font-bold text-coffee-amber">{analytics.averagePrepTime} min</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-coffee-brown/40 to-coffee-dark/40 rounded-lg p-6 border border-coffee-brown/50"
        >
          <p className="text-sm text-coffee-light mb-1">Peak Hour</p>
          <p className="text-3xl font-bold text-coffee-amber">
            {analytics.peakOrderingTime !== null ? `${analytics.peakOrderingTime}:00` : 'N/A'}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders Per Hour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
        >
          <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Orders Per Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersPerHourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5A4432" />
              <XAxis dataKey="hour" stroke="#EFEBE9" />
              <YAxis stroke="#EFEBE9" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A0F0A',
                  border: '1px solid #5A4432',
                  color: '#EFEBE9'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#FF8C00" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Most Ordered Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
        >
          <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Top 5 Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mostOrderedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5A4432" />
              <XAxis dataKey="name" stroke="#EFEBE9" />
              <YAxis stroke="#EFEBE9" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A0F0A',
                  border: '1px solid #5A4432',
                  color: '#EFEBE9'
                }}
              />
              <Legend />
              <Bar dataKey="quantity" fill="#FF8C00" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Orders by Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
      >
        <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Orders by Status</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-2xl font-bold text-coffee-amber">{count}</p>
              <p className="text-sm text-coffee-light">{status}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderAnalytics;

