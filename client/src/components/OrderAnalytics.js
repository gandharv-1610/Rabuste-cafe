import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#FF8C00', '#FF6B35', '#F7931E', '#FFA500', '#FFD700'];

const OrderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('orders'); // orders, revenue, prepTime
  const [conversationalQuery, setConversationalQuery] = useState('');
  const [conversationalAnswer, setConversationalAnswer] = useState(null);
  const [conversationalLoading, setConversationalLoading] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  
  // Date filter state
  const getDatePreset = (preset) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    switch (preset) {
      case 'today':
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return {
          startDate: todayStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          label: 'Today'
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday);
        yesterdayStart.setHours(0, 0, 0, 0);
        return {
          startDate: yesterdayStart.toISOString().split('T')[0],
          endDate: yesterday.toISOString().split('T')[0],
          label: 'Yesterday'
        };
      case 'last7':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        last7.setHours(0, 0, 0, 0);
        return {
          startDate: last7.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          label: 'Last 7 Days'
        };
      case 'last30':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        last30.setHours(0, 0, 0, 0);
        return {
          startDate: last30.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          label: 'Last 30 Days'
        };
      default:
        return null;
    }
  };

  const [dateRange, setDateRange] = useState(() => {
    const preset = getDatePreset('last30');
    return {
      startDate: preset.startDate,
      endDate: preset.endDate,
      label: preset.label
    };
  });

  useEffect(() => {
    fetchAnalytics();
    fetchInsights();
    fetchForecast();
    fetchAlerts();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await api.get(`/admin/orders/analytics?${params}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await api.get(`/admin/analytics/insights?${params}`);
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchForecast = async () => {
    setForecastLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await api.get(`/admin/analytics/forecast?${params}`);
      setForecast(response.data.forecast);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      setForecast(null);
    } finally {
      setForecastLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await api.get(`/admin/analytics/alerts?${params}`);
      setAlerts(response.data.alerts || []);
      setUnreadAlerts(response.data.alerts?.filter(a => !a.read).length || 0);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    }
  };

  const handleConversationalQuery = async () => {
    if (!conversationalQuery.trim()) return;
    
    setConversationalLoading(true);
    try {
      const response = await api.post('/admin/analytics/ask', {
        query: conversationalQuery,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setConversationalAnswer(response.data.answer);
    } catch (error) {
      console.error('Error asking query:', error);
      setConversationalAnswer("Sorry, I couldn't process your query. Please try again.");
    } finally {
      setConversationalLoading(false);
    }
  };

  const handlePresetChange = (preset) => {
    const presetData = getDatePreset(preset);
    if (presetData) {
      setDateRange(presetData);
    }
  };

  const handleCustomDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
      label: 'Custom Range'
    }));
  };

  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10;
  };

  // Format chart data
  const ordersPerHourData = analytics?.ordersPerHour?.map(item => ({
    hour: `${item.hour}:00`,
    orders: item.count,
    revenue: item.totalRevenue || 0,
    prepTime: item.avgPrepTime || 0
  })) || [];

  const mostOrderedData = analytics?.mostOrderedItems?.slice(0, 10).map(item => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    quantity: item.totalQuantity,
    revenue: item.totalRevenue,
    percentage: analytics.totalOrders > 0 
      ? ((item.totalQuantity / analytics.totalOrders) * 100).toFixed(1) 
      : 0
  })) || [];

  // Revenue breakdown data
  const revenueBySourceData = analytics?.revenueBreakdown?.bySource?.map(item => ({
    name: item._id,
    value: item.revenue,
    count: item.count
  })) || [];

  const revenueByCategoryData = analytics?.revenueBreakdown?.byCategory?.map(item => ({
    name: item._id,
    value: item.revenue,
    quantity: item.quantity
  })) || [];

  // Status data
  const statusData = analytics?.ordersByStatus ? Object.entries(analytics.ordersByStatus).map(([status, count]) => ({
    status,
    count
  })) : [];

  const statusColors = {
    'Pending': '#FFA500',
    'Preparing': '#FF8C00',
    'Ready': '#32CD32',
    'Completed': '#228B22',
    'Cancelled': '#DC143C'
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-coffee-brown/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
        <p className="font-semibold">Error loading analytics:</p>
        <p>{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-coffee-light text-center py-8">
        <p>No analytics data available for the selected date range.</p>
        <p className="text-sm mt-2">Try adjusting the date range or check if orders exist.</p>
      </div>
    );
  }

  const ordersTrend = calculateTrend(analytics.totalOrders, analytics.previousPeriod?.totalOrders);
  const revenueTrend = calculateTrend(analytics.totalRevenue.total, analytics.previousPeriod?.totalRevenue);
  const prepTimeTrend = calculateTrend(analytics.averagePrepTime, analytics.previousPeriod?.avgPrepTime);

  return (
    <div className="space-y-6">
      {/* Header with Date Filters and Alerts */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-heading font-bold text-coffee-amber mb-4">Analytics Dashboard</h2>
          
          {/* Date Filter Presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['today', 'yesterday', 'last7', 'last30'].map(preset => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  dateRange.label === getDatePreset(preset)?.label
                    ? 'bg-coffee-amber text-coffee-darker'
                    : 'bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown/80'
                }`}
              >
                {getDatePreset(preset)?.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm text-coffee-amber mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-coffee-amber mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
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

          {/* Active Filter Badge */}
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-coffee-brown/40 text-coffee-amber border border-coffee-brown/50">
              Showing: {dateRange.label || 'Custom Range'}
            </span>
          </div>
        </div>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-3 bg-coffee-brown/40 hover:bg-coffee-brown/60 rounded-lg border border-coffee-brown/50 transition-colors"
          >
            <svg className="w-6 h-6 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadAlerts > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>
          
          {/* Alerts Dropdown */}
          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-coffee-darker border border-coffee-brown rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-4 border-b border-coffee-brown">
                  <h3 className="text-lg font-bold text-coffee-amber">Alerts</h3>
                </div>
                <div className="p-2">
                  {alerts.length === 0 ? (
                    <p className="text-coffee-light text-sm p-4 text-center">No alerts</p>
                  ) : (
                    alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-3 mb-2 rounded-lg border-l-4 ${
                          alert.severity === 'high' ? 'border-red-500 bg-red-900/20' :
                          alert.severity === 'medium' ? 'border-orange-500 bg-orange-900/20' :
                          'border-yellow-500 bg-yellow-900/20'
                        }`}
                      >
                        <p className="text-sm text-coffee-cream">{alert.message}</p>
                        <p className="text-xs text-coffee-light mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced KPI Cards with Trends */}
      <div className="grid md:grid-cols-4 gap-4">
        <KPICard
          title="Total Orders"
          value={analytics.totalOrders}
          trend={ordersTrend}
          icon="📦"
          onClick={() => {/* Can add drill-down functionality */}}
        />
        <KPICard
          title="Total Revenue"
          value={`₹${analytics.totalRevenue.total.toFixed(2)}`}
          trend={revenueTrend}
          icon="💰"
        />
        <KPICard
          title="Avg Prep Time"
          value={`${analytics.averagePrepTime} min`}
          trend={prepTimeTrend}
          icon="⏱️"
          isReverseTrend={true}
        />
        <KPICard
          title="Peak Hour"
          value={analytics.peakOrderingTime !== null ? `${analytics.peakOrderingTime}:00` : 'N/A'}
          trend={null}
          icon="🕐"
        />
      </div>

      {/* Tomorrow Forecast Card */}
      {forecast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-coffee-brown/40 to-coffee-dark/40 rounded-lg p-6 border border-coffee-brown/50"
        >
          <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4 flex items-center gap-2">
            <span>🔮</span> Tomorrow's Forecast
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-coffee-light mb-1">Expected Orders</p>
              <p className="text-2xl font-bold text-coffee-amber">{forecast.expectedOrders}</p>
            </div>
            <div>
              <p className="text-sm text-coffee-light mb-1">Predicted Peak Hour</p>
              <p className="text-2xl font-bold text-coffee-amber">{forecast.predictedPeakHour}:00</p>
            </div>
            <div>
              <p className="text-sm text-coffee-light mb-1">Top Items to Prepare</p>
              <div className="text-coffee-cream">
                {forecast.topItems?.slice(0, 3).map((item, idx) => (
                  <p key={idx} className="text-sm">{idx + 1}. {item.name}</p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
      >
        <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4 flex items-center gap-2">
          <span>🤖</span> AI Insights
          {insightsLoading && <span className="text-sm font-normal text-coffee-light">(Generating...)</span>}
        </h3>
        {insightsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-coffee-brown/20 rounded animate-pulse" />
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-coffee-darker/40 rounded-lg border border-coffee-brown/30">
                <span className="text-coffee-amber mt-1">💡</span>
                <p className="text-coffee-cream flex-1">{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-coffee-light">No insights available. Try selecting a different date range.</p>
        )}
      </motion.div>

      {/* Enhanced Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders Per Hour with Metric Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-bold text-coffee-amber">Orders Per Hour</h3>
            <div className="flex gap-2">
              {['orders', 'revenue', 'prepTime'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedMetric === metric
                      ? 'bg-coffee-amber text-coffee-darker'
                      : 'bg-coffee-brown/60 text-coffee-cream hover:bg-coffee-brown/80'
                  }`}
                >
                  {metric === 'orders' ? 'Orders' : metric === 'revenue' ? 'Revenue' : 'Prep Time'}
                </button>
              ))}
            </div>
          </div>
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
              <Line
                type="monotone"
                dataKey={selectedMetric === 'orders' ? 'orders' : selectedMetric === 'revenue' ? 'revenue' : 'prepTime'}
                stroke="#FF8C00"
                strokeWidth={2}
                name={selectedMetric === 'orders' ? 'Orders' : selectedMetric === 'revenue' ? 'Revenue (₹)' : 'Prep Time (min)'}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Items - Horizontal Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
        >
          <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Top Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mostOrderedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#5A4432" />
              <XAxis type="number" stroke="#EFEBE9" />
              <YAxis dataKey="name" type="category" stroke="#EFEBE9" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A0F0A',
                  border: '1px solid #5A4432',
                  color: '#EFEBE9'
                }}
                formatter={(value, name) => {
                  if (name === 'quantity') return [value, 'Quantity'];
                  if (name === 'revenue') return [`₹${value}`, 'Revenue'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="quantity" fill="#FF8C00" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Revenue Breakdown Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
      >
        <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Revenue Breakdown</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Source */}
          <div>
            <h4 className="text-lg font-semibold text-coffee-amber mb-3">By Source</h4>
            {revenueBySourceData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenueBySourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBySourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A0F0A',
                        border: '1px solid #5A4432',
                        color: '#EFEBE9'
                      }}
                      formatter={(value) => `₹${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueBySourceData.map((item, idx) => {
                    const percentage = ((item.value / analytics.totalRevenue.total) * 100).toFixed(1);
                    return (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-coffee-cream">{item.name}</span>
                        <span className="text-coffee-amber font-semibold">₹{item.value.toFixed(2)} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-coffee-light">No data available</p>
            )}
          </div>

          {/* By Category */}
          <div>
            <h4 className="text-lg font-semibold text-coffee-amber mb-3">By Category</h4>
            {revenueByCategoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenueByCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A0F0A',
                        border: '1px solid #5A4432',
                        color: '#EFEBE9'
                      }}
                      formatter={(value) => `₹${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueByCategoryData.map((item, idx) => {
                    const percentage = ((item.value / analytics.totalRevenue.total) * 100).toFixed(1);
                    return (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-coffee-cream">{item.name}</span>
                        <span className="text-coffee-amber font-semibold">₹{item.value.toFixed(2)} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-coffee-light">No data available</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Customer Behavior & Prep Time Intelligence */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Behavior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
        >
          <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Customer Behavior</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-coffee-cream">New Customers</span>
              <span className="text-coffee-amber font-bold">{analytics.customerBehavior?.newCustomers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-coffee-cream">Returning Customers</span>
              <span className="text-coffee-amber font-bold">{analytics.customerBehavior?.returningCustomers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-coffee-cream">Average Order Value</span>
              <span className="text-coffee-amber font-bold">₹{analytics.customerBehavior?.averageOrderValue?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          {/* Popular Items by Time Slot */}
          {analytics.customerBehavior?.popularItemsByTimeSlot && analytics.customerBehavior.popularItemsByTimeSlot.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-coffee-amber mb-3">Popular Items by Time</h4>
              <div className="space-y-3">
                {analytics.customerBehavior.popularItemsByTimeSlot.map((slot, idx) => (
                  <div key={idx} className="p-3 bg-coffee-darker/40 rounded-lg">
                    <p className="font-semibold text-coffee-amber mb-2">{slot.timeSlot}</p>
                    <div className="space-y-1">
                      {slot.topItems?.slice(0, 3).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between text-sm">
                          <span className="text-coffee-cream">{item.name}</span>
                          <span className="text-coffee-amber">{item.quantity} orders</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Prep Time Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
        >
          <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Prep Time Intelligence</h3>
          
          {/* Prep Time by Hour */}
          {analytics.prepTimeIntelligence?.byHour && analytics.prepTimeIntelligence.byHour.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-coffee-amber mb-3">Average Prep Time by Hour</h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={analytics.prepTimeIntelligence.byHour}>
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
                  <Bar dataKey="avgPrepTime" fill="#FF8C00" name="Avg Prep Time (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Slow Items */}
          {analytics.prepTimeIntelligence?.perItem && analytics.prepTimeIntelligence.perItem.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-coffee-amber mb-3">Items with Longest Prep Time</h4>
              <div className="space-y-2">
                {analytics.prepTimeIntelligence.perItem.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-coffee-darker/40 rounded">
                    <span className="text-coffee-cream text-sm">{item.itemName}</span>
                    <span className="text-coffee-amber font-semibold">{item.avgPrepTime} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Orders by Status - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
      >
        <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusData.map((statusItem) => (
            <div
              key={statusItem.status}
              className="text-center p-4 bg-coffee-darker/40 rounded-lg border border-coffee-brown/30 hover:border-coffee-amber/50 transition-colors cursor-pointer"
              style={{ borderLeftColor: statusColors[statusItem.status] || '#FF8C00', borderLeftWidth: '4px' }}
            >
              <p className="text-3xl font-bold mb-2" style={{ color: statusColors[statusItem.status] || '#FF8C00' }}>
                {statusItem.count}
              </p>
              <p className="text-sm text-coffee-light">{statusItem.status}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Conversational Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50"
      >
        <h3 className="text-xl font-heading font-bold text-coffee-amber mb-4 flex items-center gap-2">
          <span>💬</span> Ask Analytics
        </h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={conversationalQuery}
              onChange={(e) => setConversationalQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConversationalQuery()}
              placeholder="e.g., Why were orders low yesterday? What should I prepare more in mornings?"
              className="flex-1 bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:border-coffee-amber"
            />
            <button
              onClick={handleConversationalQuery}
              disabled={conversationalLoading || !conversationalQuery.trim()}
              className="px-6 py-2 bg-coffee-amber text-coffee-darker rounded-lg font-semibold hover:bg-coffee-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {conversationalLoading ? 'Asking...' : 'Ask'}
            </button>
          </div>
          {conversationalAnswer && (
            <div className="p-4 bg-coffee-darker/40 rounded-lg border border-coffee-brown/30">
              <p className="text-coffee-cream">{conversationalAnswer}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, trend, icon, onClick, isReverseTrend = false }) => {
  const getTrendColor = (trendValue, isReverse) => {
    if (trendValue === null) return 'text-coffee-light';
    const isPositive = trendValue > 0;
    const shouldBeGreen = isReverse ? !isPositive : isPositive;
    return shouldBeGreen ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = (trendValue, isReverse) => {
    if (trendValue === null) return null;
    const isPositive = trendValue > 0;
    const shouldShowUp = isReverse ? !isPositive : isPositive;
    return shouldShowUp ? '▲' : '▼';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-gradient-to-br from-coffee-brown/40 to-coffee-dark/40 rounded-lg p-6 border border-coffee-brown/50 ${
        onClick ? 'cursor-pointer hover:border-coffee-amber/50 transition-colors' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-coffee-light">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-coffee-amber mb-1">{value}</p>
      {trend !== null && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor(trend, isReverseTrend)}`}>
          <span>{getTrendIcon(trend, isReverseTrend)}</span>
          <span>{Math.abs(trend)}% vs previous period</span>
        </div>
      )}
    </motion.div>
  );
};

export default OrderAnalytics;
