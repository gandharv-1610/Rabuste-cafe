import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ImageUpload from '../components/ImageUpload';
import VideoUpload from '../components/VideoUpload';
import OrdersManagement from '../components/OrdersManagement';
import OrderAnalytics from '../components/OrderAnalytics';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [coffees, setCoffees] = useState([]);
  const [arts, setArts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [artEnquiries, setArtEnquiries] = useState([]);
  const [artOrders, setArtOrders] = useState([]);
  const [artistRequests, setArtistRequests] = useState([]);
  const [siteMedia, setSiteMedia] = useState([]);
  const [billingSettings, setBillingSettings] = useState(null);
  const [billingOffers, setBillingOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerEngagementStats, setCustomerEngagementStats] = useState(null);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'coffee') fetchCoffees();
    if (activeTab === 'art') {
      fetchArts();
      fetchArtEnquiries();
    }
    if (activeTab === 'artOrders') {
      fetchArtOrders();
    }
    if (activeTab === 'artistRequests') {
      fetchArtistRequests();
    }
    if (activeTab === 'workshops') {
      fetchWorkshops();
      fetchRegistrations();
    }
    if (activeTab === 'franchise') fetchEnquiries();
    if (activeTab === 'siteMedia') fetchSiteMedia();
    if (activeTab === 'billing') {
      fetchBillingSettings();
      fetchBillingOffers();
    }
    if (activeTab === 'customerEngagement') fetchCustomerEngagementStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCoffees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coffee');
      setCoffees(response.data);
    } catch (error) {
      console.error('Error fetching coffees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/art');
      setArts(response.data);
    } catch (error) {
      console.error('Error fetching arts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workshops');
      setWorkshops(response.data);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/admin/registrations');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/franchise/enquiries');
      setEnquiries(response.data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtEnquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/art-enquiries');
      setArtEnquiries(response.data);
    } catch (error) {
      console.error('Error fetching art enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/art-orders');
      setArtOrders(response.data);
    } catch (error) {
      console.error('Error fetching art orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/artist-requests');
      setArtistRequests(response.data);
    } catch (error) {
      console.error('Error fetching artist requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteMedia = async () => {
    setLoading(true);
    try {
      const response = await api.get('/site-media');
      setSiteMedia(response.data);
    } catch (error) {
      console.error('Error fetching site media:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingSettings = async () => {
    try {
      const response = await api.get('/billing/settings');
      setBillingSettings(response.data);
    } catch (error) {
      console.error('Error fetching billing settings:', error);
    }
  };

  const fetchBillingOffers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/billing/offers');
      setBillingOffers(response.data);
    } catch (error) {
      console.error('Error fetching billing offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerEngagementStats = async () => {
    try {
      const response = await api.get('/admin/customer-engagement/stats');
      setCustomerEngagementStats(response.data);
    } catch (error) {
      console.error('Error fetching customer engagement stats:', error);
    }
  };

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('rabuste_sound_enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'counter', label: 'Counter Order' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'coffee', label: 'Coffee Menu' },
    { id: 'art', label: 'Art Gallery' },
    { id: 'artOrders', label: 'Art Orders' },
    { id: 'artistRequests', label: 'Artist Requests' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'franchise', label: 'Franchise Enquiries' },
    { id: 'billing', label: 'Billing' },
    { id: 'customerEngagement', label: 'Customer Engagement' },
    { id: 'siteMedia', label: 'Site Media' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('rabuste_sound_enabled', JSON.stringify(newValue));
  };

  const handleLogout = () => {
    localStorage.removeItem('rabuste_admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="pt-20 min-h-screen bg-coffee-darker">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-display font-bold text-coffee-amber">Admin Panel</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-500/60 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-300 hover:bg-red-500/20 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-coffee-brown">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-coffee-amber border-b-2 border-coffee-amber'
                  : 'text-coffee-light hover:text-coffee-amber'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {stats ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-coffee-brown/20 rounded-lg p-6">
                  <h3 className="text-coffee-light text-sm mb-2">Coffee Items</h3>
                  <p className="text-3xl font-bold text-coffee-amber">{stats.coffee}</p>
                </div>
                <div className="bg-coffee-brown/20 rounded-lg p-6">
                  <h3 className="text-coffee-light text-sm mb-2">Art Pieces</h3>
                  <p className="text-3xl font-bold text-coffee-amber">{stats.art}</p>
                </div>
                <div className="bg-coffee-brown/20 rounded-lg p-6">
                  <h3 className="text-coffee-light text-sm mb-2">Workshops</h3>
                  <p className="text-3xl font-bold text-coffee-amber">{stats.workshops}</p>
                </div>
                <div className="bg-coffee-brown/20 rounded-lg p-6">
                  <h3 className="text-coffee-light text-sm mb-2">Franchise Enquiries</h3>
                  <p className="text-3xl font-bold text-coffee-amber">{stats.franchiseEnquiries}</p>
                  {stats.newEnquiries > 0 && (
                    <p className="text-sm text-coffee-amber mt-2">{stats.newEnquiries} new</p>
                  )}
                </div>
                <div className="bg-coffee-brown/20 rounded-lg p-6">
                  <h3 className="text-coffee-light text-sm mb-2">Art Enquiries</h3>
                  <p className="text-3xl font-bold text-coffee-amber">{stats.artEnquiries || 0}</p>
                  {stats.newArtEnquiries > 0 && (
                    <p className="text-sm text-coffee-amber mt-2">{stats.newArtEnquiries} new</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-coffee-amber text-xl mb-2">Loading dashboard...</div>
                <div className="text-coffee-light/60 text-sm">Fetching statistics...</div>
              </div>
            )}
          </>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <OrdersManagement
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
          />
        )}

        {/* Counter Order */}
        {activeTab === 'counter' && (
          <div className="text-center py-8">
            <button
              onClick={() => navigate('/counter')}
              className="px-6 py-3 bg-coffee-amber text-coffee-darker rounded-lg font-bold hover:bg-coffee-gold text-lg"
            >
              Open Counter Order Page
            </button>
          </div>
        )}

        {/* Order Analytics */}
        {activeTab === 'analytics' && (
          <OrderAnalytics />
        )}

        {/* Coffee Management */}
        {activeTab === 'coffee' && (
          <CoffeeManagement
            coffees={coffees}
            loading={loading}
            onRefresh={fetchCoffees}
          />
        )}

        {/* Art Management */}
        {activeTab === 'art' && (
          <ArtManagement
            arts={arts}
            artEnquiries={artEnquiries}
            loading={loading}
            onRefresh={fetchArts}
            onRefreshEnquiries={fetchArtEnquiries}
          />
        )}

        {/* Art Orders Management */}
        {activeTab === 'artOrders' && (
          <ArtOrdersManagement
            orders={artOrders}
            loading={loading}
            onRefresh={fetchArtOrders}
          />
        )}

        {/* Artist Requests Management */}
        {activeTab === 'artistRequests' && (
          <ArtistRequestsManagement
            requests={artistRequests}
            loading={loading}
            onRefresh={fetchArtistRequests}
          />
        )}

        {/* Workshops Management */}
        {activeTab === 'workshops' && (
          <WorkshopsManagement
            workshops={workshops}
            registrations={registrations}
            loading={loading}
            onRefresh={fetchWorkshops}
            onRefreshRegistrations={fetchRegistrations}
            setRegistrations={setRegistrations}
          />
        )}

        {/* Franchise Enquiries */}
        {activeTab === 'franchise' && (
          <FranchiseEnquiries
            enquiries={enquiries}
            loading={loading}
            onRefresh={fetchEnquiries}
          />
        )}

        {/* Customer Engagement */}
        {activeTab === 'customerEngagement' && (
          <CustomerEngagement
            stats={customerEngagementStats}
            onRefresh={fetchCustomerEngagementStats}
          />
        )}

        {/* Site Media Management */}
        {activeTab === 'siteMedia' && (
          <SiteMediaManagement
            media={siteMedia}
            loading={loading}
            onRefresh={fetchSiteMedia}
          />
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <BillingManagement
            billingSettings={billingSettings}
            billingOffers={billingOffers}
            loading={loading}
            onRefreshSettings={fetchBillingSettings}
            onRefreshOffers={fetchBillingOffers}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && <PasswordChange />}
      </div>
    </div>
  );
};

// Password Change Component
const PasswordChange = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await api.post('/admin/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Failed to change password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-coffee-amber mb-6">
        Change Password
      </h2>

      <div className="bg-coffee-brown/20 rounded-lg p-6 max-w-2xl">
        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-500/10 border border-green-500/40 px-4 py-3 text-sm text-green-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              placeholder="Enter your current password"
            />
          </div>

          <div>
            <label className="block text-coffee-amber font-semibold mb-2">
              New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              placeholder="Enter new password (min. 8 characters)"
            />
            <p className="text-xs text-coffee-light/70 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-coffee-amber font-semibold mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              placeholder="Confirm your new password"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Coffee Management Component
const CoffeeManagement = ({ coffees, loading, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState(null);
  const defaultCategories = ['Coffee', 'Tea', 'Shakes', 'Sides'];
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Coffee',
    subcategory: '',
    milkType: '',
    strength: 'Medium',
    flavorNotes: '',
    price: '',
    priceBlend: '',
    priceRobustaSpecial: '',
    prepTime: '5',
    isBestseller: false,
    image: '',
    cloudinary_url: '',
    cloudinary_public_id: ''
  });

  const handleImageUpload = (uploadResult) => {
    setFormData({
      ...formData,
      image: uploadResult.url,
      cloudinary_url: uploadResult.cloudinary_url,
      cloudinary_public_id: uploadResult.cloudinary_public_id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const coffeeData = {
      ...formData,
      price: formData.category === 'Coffee' ? undefined : (parseFloat(formData.price) || 0),
      priceBlend: formData.category === 'Coffee' ? (formData.priceBlend && formData.priceBlend.trim() ? parseFloat(formData.priceBlend) : undefined) : undefined,
      priceRobustaSpecial: formData.category === 'Coffee' ? (formData.priceRobustaSpecial && formData.priceRobustaSpecial.trim() ? parseFloat(formData.priceRobustaSpecial) : undefined) : undefined,
      prepTime: parseFloat(formData.prepTime) || 5,
      flavorNotes: formData.flavorNotes.split(',').map(f => f.trim()).filter(f => f),
      // Only include strength, subcategory, and milkType if category is Coffee
      ...(formData.category === 'Coffee' 
        ? { 
            strength: formData.strength,
            subcategory: formData.subcategory || null,
            milkType: formData.milkType || null
          } 
        : { 
            strength: undefined,
            subcategory: null,
            milkType: null
          }
      )
    };

    try {
      if (editingCoffee) {
        await api.put(`/coffee/${editingCoffee._id}`, coffeeData);
      } else {
        await api.post('/coffee', coffeeData);
      }
      setShowForm(false);
      setEditingCoffee(null);
      setFormData({ 
        name: '', 
        description: '', 
        category: 'Coffee',
        subcategory: '',
        milkType: '',
        strength: 'Medium', 
        flavorNotes: '', 
        price: '',
        priceBlend: '',
        priceRobustaSpecial: '',
        prepTime: '5',
        isBestseller: false,
        image: '',
        cloudinary_url: '',
        cloudinary_public_id: ''
      });
      onRefresh();
    } catch (error) {
      toast.error('Error saving menu item');
      console.error(error);
    }
  };

  const handleEdit = (coffee) => {
    setEditingCoffee(coffee);
    setFormData({
      name: coffee.name,
      description: coffee.description,
      category: coffee.category || 'Coffee',
      subcategory: coffee.subcategory || '',
      milkType: coffee.milkType || '',
      strength: coffee.strength || 'Medium',
      flavorNotes: coffee.flavorNotes?.join(', ') || '',
      price: coffee.price?.toString() || '',
      priceBlend: coffee.priceBlend?.toString() || '',
      priceRobustaSpecial: coffee.priceRobustaSpecial?.toString() || '',
      prepTime: coffee.prepTime?.toString() || '5',
      isBestseller: coffee.isBestseller || false,
      image: coffee.image || coffee.cloudinary_url || '',
      cloudinary_url: coffee.cloudinary_url || '',
      cloudinary_public_id: coffee.cloudinary_public_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coffee item?')) return;
    try {
      await api.delete(`/coffee/${id}`);
      onRefresh();
    } catch (error) {
      toast.error('Error deleting coffee item');
    }
  };

  if (loading) return <div className="text-coffee-light">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Menu Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCoffee(null);
            setFormData({ 
              name: '', 
              description: '', 
              category: 'Coffee',
              subcategory: '',
              milkType: '',
              strength: 'Medium', 
              flavorNotes: '', 
              price: '',
              priceBlend: '',
              priceRobustaSpecial: '',
              prepTime: '5',
              isBestseller: false,
              image: '',
              cloudinary_url: '',
              cloudinary_public_id: ''
            });
          }}
          className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Add Menu Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-coffee-brown/20 rounded-lg p-6 mb-6 space-y-4">
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ 
                  ...formData, 
                  category: value,
                  // Reset subcategory and milkType when category changes
                  subcategory: value === 'Coffee' ? formData.subcategory : '',
                  milkType: value === 'Coffee' ? formData.milkType : ''
                });
              }}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 mb-2"
            >
              {defaultCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {formData.category === 'Coffee' && (
            <>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Temperature</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                >
                  <option value="">Select Temperature</option>
                  <option value="Hot">Hot</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Milk Type</label>
                <select
                  value={formData.milkType}
                  onChange={(e) => setFormData({ ...formData, milkType: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                >
                  <option value="">Select Milk Type</option>
                  <option value="Milk">With Milk</option>
                  <option value="Non-Milk">Non-Milk</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
          {formData.category === 'Coffee' && (
            <>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Strength *</label>
                <select
                  required
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                >
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Strong">Strong</option>
                  <option value="Extra Strong">Extra Strong</option>
                </select>
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Flavor Notes (comma-separated)</label>
                <input
                  type="text"
                  value={formData.flavorNotes}
                  onChange={(e) => setFormData({ ...formData, flavorNotes: e.target.value })}
                  placeholder="chocolate, nutty, bold"
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
            </>
          )}
          {formData.category === 'Coffee' ? (
            <>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Price - Blend</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceBlend}
                  onChange={(e) => setFormData({ ...formData, priceBlend: e.target.value })}
                  placeholder="0.00 (optional)"
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Price - Robusta Special</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceRobustaSpecial}
                  onChange={(e) => setFormData({ ...formData, priceRobustaSpecial: e.target.value })}
                  placeholder="0.00 (optional)"
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Prep Time (minutes) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  placeholder="5"
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
                <p className="text-xs text-coffee-light mt-1">Estimated preparation time in minutes</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Price *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Prep Time (minutes) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  placeholder="5"
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
                <p className="text-xs text-coffee-light mt-1">Estimated preparation time in minutes</p>
              </div>
            </>
          )}
          <ImageUpload
            onUploadComplete={handleImageUpload}
            folder="rabuste-coffee/menu"
            existingUrl={formData.image || formData.cloudinary_url}
          />
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isBestseller}
                onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                className="mr-2"
              />
              <span className="text-coffee-amber font-semibold">Bestseller</span>
            </label>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold">
              {editingCoffee ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingCoffee(null);
              }}
              className="bg-coffee-brown/40 text-coffee-cream px-6 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coffees.map((coffee) => (
          <div key={coffee._id} className="bg-coffee-brown/20 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block bg-coffee-brown/40 text-coffee-amber text-xs px-2 py-1 rounded mb-2">
                  {coffee.category}
                </span>
                <h3 className="text-xl font-display font-bold text-coffee-amber">{coffee.name}</h3>
              </div>
              {coffee.isBestseller && (
                <span className="bg-coffee-amber text-coffee-darker text-xs px-2 py-1 rounded">Bestseller</span>
              )}
            </div>
            {(coffee.image || coffee.cloudinary_url) && (
              <img
                src={coffee.cloudinary_url || coffee.image}
                alt={coffee.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <p className="text-coffee-light text-sm mb-4 line-clamp-2">{coffee.description}</p>
            {coffee.category === 'Coffee' && (
              <p className="text-coffee-amber text-sm mb-2">Strength: {coffee.strength}</p>
            )}
            <p className="text-coffee-amber font-bold mb-4">₹{coffee.price?.toFixed(2) || '0.00'}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(coffee)}
                className="flex-1 bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(coffee._id)}
                className="flex-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Art Management Component
const ArtManagement = ({ arts, artEnquiries, loading, onRefresh, onRefreshEnquiries }) => {
  const [showEnquiries, setShowEnquiries] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArt, setEditingArt] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    artistStory: '',
    description: '',
    price: '',
    image: '',
    cloudinary_url: '',
    cloudinary_public_id: '',
    availability: 'Available',
    dimensions: '',
  });

  const handleImageUpload = (uploadResult) => {
    setFormData({
      ...formData,
      image: uploadResult.url,
      cloudinary_url: uploadResult.cloudinary_url,
      cloudinary_public_id: uploadResult.cloudinary_public_id,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const artData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      if (editingArt) {
        await api.put(`/art/${editingArt._id}`, artData);
      } else {
        await api.post('/art', artData);
      }
      setShowForm(false);
      setEditingArt(null);
      setFormData({
        title: '',
        artistName: '',
        artistStory: '',
        description: '',
        price: '',
        image: '',
        cloudinary_url: '',
        cloudinary_public_id: '',
        availability: 'Available',
        dimensions: '',
      });
      onRefresh();
    } catch (error) {
      toast.error('Error saving art piece');
    }
  };

  const handleEdit = (art) => {
    setEditingArt(art);
    setFormData({
      title: art.title,
      artistName: art.artistName,
      artistStory: art.artistStory || '',
      description: art.description,
      price: art.price.toString(),
      image: art.image || art.cloudinary_url || '',
      cloudinary_url: art.cloudinary_url || '',
      cloudinary_public_id: art.cloudinary_public_id || '',
      availability: art.availability,
      dimensions: art.dimensions || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this art piece?')) return;
    try {
      await api.delete(`/art/${id}`);
      onRefresh();
    } catch (error) {
      toast.error('Error deleting art piece');
    }
  };

  if (loading) return <div className="text-coffee-light">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">
          {showEnquiries ? 'Art Enquiries' : 'Art Gallery Management'}
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowEnquiries(false)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              !showEnquiries
                ? 'bg-coffee-amber text-coffee-darker'
                : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
            }`}
          >
            Art Pieces
          </button>
          <button
            onClick={() => {
              setShowEnquiries(true);
              onRefreshEnquiries();
            }}
            className={`px-4 py-2 rounded-lg font-semibold relative ${
              showEnquiries
                ? 'bg-coffee-amber text-coffee-darker'
                : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
            }`}
          >
            Enquiries
            {artEnquiries.filter(e => e.status === 'New').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {artEnquiries.filter(e => e.status === 'New').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showEnquiries ? (
        <ArtEnquiries
          enquiries={artEnquiries}
          loading={loading}
          onRefresh={onRefreshEnquiries}
        />
      ) : (
        <>
          <div className="mb-6">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingArt(null);
                setFormData({
                  title: '',
                  artistName: '',
                  artistStory: '',
                  description: '',
                  price: '',
                  image: '',
                  availability: 'Available',
                  dimensions: '',
                });
              }}
              className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
            >
              Add Art Piece
            </button>
          </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-coffee-brown/20 rounded-lg p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Artist Name *</label>
              <input
                type="text"
                required
                value={formData.artistName}
                onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Artist Story</label>
            <textarea
              value={formData.artistStory}
              onChange={(e) => setFormData({ ...formData, artistStory: e.target.value })}
              rows="2"
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Price *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Availability *</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 24x30 inches"
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <ImageUpload
            onUploadComplete={handleImageUpload}
            folder="rabuste-coffee/art-gallery"
            existingUrl={formData.image || formData.cloudinary_url}
          />
          <div className="flex gap-4">
            <button type="submit" className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold">
              {editingArt ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingArt(null);
              }}
              className="bg-coffee-brown/40 text-coffee-cream px-6 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {arts.map((art) => (
          <div key={art._id} className="bg-coffee-brown/20 rounded-lg p-6">
            <h3 className="text-xl font-display font-bold text-coffee-amber mb-2">{art.title}</h3>
            <p className="text-coffee-light text-sm mb-2">by {art.artistName}</p>
            <p className="text-coffee-amber font-bold mb-2">₹{art.price}</p>
            <p className={`text-sm mb-4 ${
              art.availability === 'Available' ? 'text-green-400' :
              art.availability === 'Sold' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {art.availability}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(art)}
                className="flex-1 bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(art._id)}
                className="flex-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
};

// Art Enquiries Component
const ArtEnquiries = ({ enquiries, loading, onRefresh }) => {
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/art-enquiries/${id}/status`, { status });
      onRefresh();
      setSelectedEnquiry(null);
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  if (loading) return <div className="text-coffee-light">Loading...</div>;

  return (
    <div>
      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-coffee-light">No art enquiries yet.</p>
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <div
              key={enquiry._id}
              className="bg-coffee-brown/20 rounded-lg p-6 cursor-pointer hover:bg-coffee-brown/30"
              onClick={() => setSelectedEnquiry(enquiry)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-coffee-amber">{enquiry.name}</h3>
                  <p className="text-coffee-light">{enquiry.email} | {enquiry.phone}</p>
                  {enquiry.artId && (
                    <p className="text-coffee-light">
                      Art: {enquiry.artId.title} by {enquiry.artId.artistName}
                    </p>
                  )}
                  <p className="text-coffee-light text-sm">
                    Type: {enquiry.enquiryType} | Submitted: {new Date(enquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  enquiry.status === 'New' ? 'bg-green-500/20 text-green-400' :
                  enquiry.status === 'Contacted' ? 'bg-blue-500/20 text-blue-400' :
                  enquiry.status === 'In Progress' ? 'bg-coffee-amber/30 text-coffee-amber' :
                  enquiry.status === 'Resolved' ? 'bg-green-500/30 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {enquiry.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEnquiry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEnquiry(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-display font-bold text-coffee-amber mb-6">{selectedEnquiry.name}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-coffee-amber font-semibold mb-2">Contact Information</h3>
                <p className="text-coffee-light">Email: {selectedEnquiry.email}</p>
                <p className="text-coffee-light">Phone: {selectedEnquiry.phone}</p>
              </div>
              {selectedEnquiry.artId && (
                <div>
                  <h3 className="text-coffee-amber font-semibold mb-2">Art Piece</h3>
                  <p className="text-coffee-light">Title: {selectedEnquiry.artId.title}</p>
                  <p className="text-coffee-light">Artist: {selectedEnquiry.artId.artistName}</p>
                  <p className="text-coffee-light">Price: ₹{selectedEnquiry.artId.price}</p>
                  {selectedEnquiry.artId.image && (
                    <img
                      src={selectedEnquiry.artId.image}
                      alt={selectedEnquiry.artId.title}
                      className="w-full max-w-xs h-auto rounded-lg mt-2"
                    />
                  )}
                </div>
              )}
              <div>
                <h3 className="text-coffee-amber font-semibold mb-2">Enquiry Type</h3>
                <p className="text-coffee-light">{selectedEnquiry.enquiryType}</p>
              </div>
              {selectedEnquiry.message && (
                <div>
                  <h3 className="text-coffee-amber font-semibold mb-2">Message</h3>
                  <p className="text-coffee-light">{selectedEnquiry.message}</p>
                </div>
              )}
              <div>
                <h3 className="text-coffee-amber font-semibold mb-2">Submitted</h3>
                <p className="text-coffee-light">{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => handleStatusUpdate(selectedEnquiry._id, 'Contacted')}
                className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-semibold"
              >
                Mark Contacted
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedEnquiry._id, 'In Progress')}
                className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedEnquiry._id, 'Resolved')}
                className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-semibold"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => {
                  setSelectedEnquiry(null);
                }}
                className="bg-coffee-brown/40 text-coffee-cream px-4 py-2 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Entry Counter Search Component
const EntryCounterSearch = ({ onSearch, onClear }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      onClear();
      return;
    }
    try {
      const response = await api.get('/admin/registrations/search', {
        params: { query: searchQuery.trim() }
      });
      onSearch(response.data);
    } catch (error) {
      console.error('Error searching registrations:', error);
      toast.error('Error searching registrations');
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Search by name, phone, email, or confirmation code..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        className="flex-1 bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
      />
      <button
        onClick={handleSearch}
        className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
      >
        Search
      </button>
      <button
        onClick={() => {
          setSearchQuery('');
          onClear();
        }}
        className="bg-coffee-brown/40 text-coffee-cream px-6 py-2 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
      >
        Clear
      </button>
    </div>
  );
};

// Workshops Management Component
const WorkshopsManagement = ({ workshops, registrations, loading, onRefresh, onRefreshRegistrations, setRegistrations }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Coffee Workshop',
    date: '',
    time: '',
    duration: '2 hours',
    maxSeats: '',
    price: '',
    instructor: '',
    image: '',
    cloudinary_url: '',
    cloudinary_public_id: '',
    video_url: '',
    cloudinary_video_public_id: '',
  });

  const handleImageUpload = (uploadResult) => {
    setFormData({
      ...formData,
      image: uploadResult.url,
      cloudinary_url: uploadResult.cloudinary_url,
      cloudinary_public_id: uploadResult.cloudinary_public_id,
    });
  };

  const handleVideoUpload = (uploadResult) => {
    setFormData({
      ...formData,
      video_url: uploadResult.url,
      cloudinary_video_public_id: uploadResult.cloudinary_video_public_id || uploadResult.cloudinary_public_id,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const workshopData = {
      ...formData,
      maxSeats: parseInt(formData.maxSeats),
      price: parseFloat(formData.price) || 0,
      date: new Date(formData.date),
    };

    try {
      if (editingWorkshop) {
        await api.put(`/workshops/${editingWorkshop._id}`, workshopData);
      } else {
        await api.post('/workshops', workshopData);
      }
      setShowForm(false);
      setEditingWorkshop(null);
      setFormData({
        title: '',
        description: '',
        type: 'Coffee Workshop',
        date: '',
        time: '',
        duration: '2 hours',
        maxSeats: '',
        price: '',
        instructor: '',
        image: '',
        cloudinary_url: '',
        cloudinary_public_id: '',
        video_url: '',
        cloudinary_video_public_id: '',
      });
      onRefresh();
    } catch (error) {
      toast.error('Error saving workshop');
    }
  };

  const handleEdit = (workshop) => {
    setEditingWorkshop(workshop);
    const dateStr = new Date(workshop.date).toISOString().split('T')[0];
    setFormData({
      title: workshop.title,
      description: workshop.description,
      type: workshop.type,
      date: dateStr,
      time: workshop.time,
      duration: workshop.duration,
      maxSeats: workshop.maxSeats.toString(),
      price: workshop.price.toString(),
      instructor: workshop.instructor || '',
      image: workshop.image || workshop.cloudinary_url || '',
      cloudinary_url: workshop.cloudinary_url || '',
      cloudinary_public_id: workshop.cloudinary_public_id || '',
      video_url: workshop.video_url || '',
      cloudinary_video_public_id: workshop.cloudinary_video_public_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    try {
      await api.delete(`/workshops/${id}`);
      onRefresh();
    } catch (error) {
      toast.error('Error deleting workshop');
    }
  };

  if (loading) return <div className="text-coffee-light">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Workshops Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingWorkshop(null);
            setFormData({
              title: '',
              description: '',
              type: 'Coffee Workshop',
              date: '',
              time: '',
              duration: '2 hours',
              maxSeats: '',
              price: '',
              instructor: '',
            });
          }}
          className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Create Workshop
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-coffee-brown/20 rounded-lg p-6 mb-6 space-y-4">
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="Coffee Workshop">Coffee Workshop</option>
                <option value="Art & Creativity Workshop">Art & Creativity Workshop</option>
                <option value="Community Session">Community Session</option>
              </select>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Time *</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g., 10:00 AM"
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Max Seats *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxSeats}
                onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Instructor</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Cover Image</label>
              <ImageUpload
                onUploadComplete={handleImageUpload}
                folder="rabuste-coffee/workshops"
                existingUrl={formData.image || formData.cloudinary_url}
              />
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Promo Video (optional)</label>
              <VideoUpload
                onUploadComplete={handleVideoUpload}
                folder="rabuste-coffee/workshops/videos"
                existingUrl={formData.video_url}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold">
              {editingWorkshop ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingWorkshop(null);
              }}
              className="bg-coffee-brown/40 text-coffee-cream px-6 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 mb-8">
        {workshops.map((workshop) => (
          <div key={workshop._id} className="bg-coffee-brown/20 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-display font-bold text-coffee-amber">{workshop.title}</h3>
                <p className="text-coffee-light text-sm">{workshop.type}</p>
                <p className="text-coffee-light text-sm">
                  {new Date(workshop.date).toLocaleDateString()} at {workshop.time}
                </p>
                <p className="text-coffee-amber text-sm">
                  {workshop.bookedSeats} / {workshop.maxSeats} seats booked
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(workshop)}
                  className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(workshop._id)}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Entry Counter Search */}
      <div className="mt-8 mb-6">
        <h3 className="text-2xl font-display font-bold text-coffee-amber mb-4">Entry Counter Search</h3>
        <EntryCounterSearch onSearch={setRegistrations} onClear={onRefreshRegistrations} />
      </div>

      {/* Registrations */}
      <div className="mt-8">
        <h3 className="text-2xl font-display font-bold text-coffee-amber mb-4">Registrations</h3>
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <p className="text-coffee-light">No registrations yet.</p>
          ) : (
            registrations.slice(0, 10).map((reg) => {
              // Payment status badge styling
              const getPaymentStatusBadge = (status) => {
                const badges = {
                  'FREE': 'bg-green-500/20 text-green-400 border-green-500/40',
                  'PAID_ONLINE': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
                  'PENDING_ENTRY_PAYMENT': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
                  'PAID_AT_ENTRY': 'bg-green-500/20 text-green-400 border-green-500/40'
                };
                return badges[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/40';
              };

              const getPaymentMethodLabel = (method) => {
                const labels = {
                  'FREE': 'Free',
                  'ONLINE': 'Online',
                  'PAY_AT_ENTRY': 'Pay at Entry'
                };
                return labels[method] || method;
              };

              const getPaymentStatusLabel = (status) => {
                const labels = {
                  'FREE': 'Free',
                  'PAID_ONLINE': 'Paid Online',
                  'PENDING_ENTRY_PAYMENT': 'Payment Pending',
                  'PAID_AT_ENTRY': 'Paid at Entry'
                };
                return labels[status] || status;
              };

              return (
                <div key={reg._id} className="bg-coffee-brown/20 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-coffee-amber font-semibold">{reg.name}</p>
                    <p className="text-coffee-light text-sm">{reg.email} | {reg.phone}</p>
                    <p className="text-coffee-light text-sm">
                      Workshop: {reg.workshopId?.title || 'N/A'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded border ${getPaymentStatusBadge(reg.paymentStatus)}`}>
                        {getPaymentStatusLabel(reg.paymentStatus)}
                      </span>
                      {reg.paymentMethod && reg.paymentMethod !== 'FREE' && (
                        <span className="text-xs text-coffee-light">
                          ({getPaymentMethodLabel(reg.paymentMethod)})
                        </span>
                      )}
                      {reg.amount > 0 && (
                        <span className="text-xs text-coffee-amber font-semibold">
                          ₹{reg.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {reg.confirmationCode && (
                      <p className="text-coffee-light text-xs mt-1">
                        Code: {reg.confirmationCode}
                      </p>
                    )}
                    {reg.message && (
                      <p className="text-coffee-light text-sm mt-2 italic">"{reg.message}"</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        reg.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                        reg.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                    {reg.paymentStatus === 'PENDING_ENTRY_PAYMENT' && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Mark payment as paid for ${reg.name}?`)) {
                            try {
                              await api.put(`/admin/registrations/${reg._id}/mark-paid`);
                              if (onRefreshRegistrations) {
                                onRefreshRegistrations();
                              }
                              toast.success('Payment marked as paid successfully');
                            } catch (error) {
                              toast.error(error.response?.data?.message || 'Error marking payment as paid');
                              console.error(error);
                            }
                          }
                        }}
                        className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition-colors"
                        title="Mark Payment as Paid"
                      >
                        ✓ Mark Paid
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete the registration for ${reg.name}?`)) {
                          try {
                            await api.delete(`/admin/registrations/${reg._id}`);
                            onRefresh();
                            if (onRefreshRegistrations) {
                              onRefreshRegistrations();
                            }
                          } catch (error) {
                            toast.error('Error deleting registration');
                            console.error(error);
                          }
                        }
                      }}
                      className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-colors"
                      title="Delete Registration"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Franchise Enquiries Component
const FranchiseEnquiries = ({ enquiries, loading, onRefresh }) => {
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/franchise/enquiries/${id}`, { status });
      onRefresh();
      setSelectedEnquiry(null);
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  if (loading) return <div className="text-coffee-light">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-coffee-amber mb-6">Franchise Enquiries</h2>
      <div className="space-y-4">
        {enquiries.map((enquiry) => (
          <div
            key={enquiry._id}
            className="bg-coffee-brown/20 rounded-lg p-6 cursor-pointer hover:bg-coffee-brown/30"
            onClick={() => setSelectedEnquiry(enquiry)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-display font-bold text-coffee-amber">{enquiry.name}</h3>
                <p className="text-coffee-light">{enquiry.email} | {enquiry.phone}</p>
                <p className="text-coffee-light">Location: {enquiry.location}</p>
                <p className="text-coffee-light text-sm">
                  Submitted: {new Date(enquiry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                enquiry.status === 'New' ? 'bg-green-500/20 text-green-400' :
                enquiry.status === 'Contacted' ? 'bg-blue-500/20 text-blue-400' :
                enquiry.status === 'Qualified' ? 'bg-coffee-amber/30 text-coffee-amber' :
                'bg-red-500/20 text-red-400'
              }`}>
                {enquiry.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedEnquiry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEnquiry(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-display font-bold text-coffee-amber mb-6">{selectedEnquiry.name}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-coffee-amber font-semibold mb-2">Contact Information</h3>
                <p className="text-coffee-light">Email: {selectedEnquiry.email}</p>
                <p className="text-coffee-light">Phone: {selectedEnquiry.phone}</p>
                <p className="text-coffee-light">Location: {selectedEnquiry.location}</p>
              </div>
              {selectedEnquiry.investmentRange && (
                <div>
                  <h3 className="text-coffee-amber font-semibold mb-2">Investment Range</h3>
                  <p className="text-coffee-light">{selectedEnquiry.investmentRange}</p>
                </div>
              )}
              {selectedEnquiry.experience && (
                <div>
                  <h3 className="text-coffee-amber font-semibold mb-2">Experience</h3>
                  <p className="text-coffee-light">{selectedEnquiry.experience}</p>
                </div>
              )}
              {selectedEnquiry.message && (
                <div>
                  <h3 className="text-coffee-amber font-semibold mb-2">Message</h3>
                  <p className="text-coffee-light">{selectedEnquiry.message}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleStatusUpdate(selectedEnquiry._id, 'Contacted')}
                className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-semibold"
              >
                Mark Contacted
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedEnquiry._id, 'Qualified')}
                className="flex-1 bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold"
              >
                Mark Qualified
              </button>
              <button
                onClick={() => {
                  setSelectedEnquiry(null);
                }}
                className="bg-coffee-brown/40 text-coffee-cream px-4 py-2 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Site Media Management Component
const SiteMediaManagement = ({ media, loading, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [formData, setFormData] = useState({
    page: 'home',
    section: 'home_hero_background',
    label: '',
    mediaType: 'image',
    url: '',
    cloudinary_public_id: '',
    usage: 'background',
    order: 0,
    isActive: true,
  });

  const handleImageUpload = (uploadResult) => {
    setFormData({
      ...formData,
      url: uploadResult.url,
      cloudinary_public_id: uploadResult.cloudinary_public_id,
      mediaType: 'image',
    });
  };

  const handleVideoUpload = (uploadResult) => {
    setFormData({
      ...formData,
      url: uploadResult.url,
      cloudinary_public_id: uploadResult.cloudinary_video_public_id || uploadResult.cloudinary_public_id,
      mediaType: 'video',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      page: formData.page.toLowerCase(),
      order: Number(formData.order) || 0,
    };

    try {
      if (editingMedia) {
        await api.put(`/site-media/${editingMedia._id}`, payload);
      } else {
        await api.post('/site-media', payload);
      }
      setShowForm(false);
      setEditingMedia(null);
      setFormData({
        page: 'home',
        section: 'home_hero_background',
        label: '',
        mediaType: 'image',
        url: '',
        cloudinary_public_id: '',
        usage: 'background',
        order: 0,
        isActive: true,
      });
      onRefresh();
    } catch (error) {
      toast.error('Error saving site media');
      console.error(error);
    }
  };

  const handleEdit = (entry) => {
    setEditingMedia(entry);
    setFormData({
      page: entry.page || 'home',
      section: entry.section || 'home_hero_background',
      label: entry.label || '',
      mediaType: entry.mediaType || 'image',
      url: entry.url || '',
      cloudinary_public_id: entry.cloudinary_public_id || '',
      usage: entry.usage || '',
      order: entry.order ?? 0,
      isActive: entry.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media entry?')) return;
    try {
      await api.delete(`/site-media/${id}`);
      onRefresh();
    } catch (error) {
      toast.error('Error deleting media entry');
      console.error(error);
    }
  };

  if (loading && media.length === 0) return <div className="text-coffee-light">Loading...</div>;

  // Small helper list of known sections for convenience
  const knownSections = [
    { value: 'home_hero_background', label: 'Home - Hero Background' },
    { value: 'home_story_coffee', label: 'Home - Story Coffee Visual' },
    { value: 'home_story_art', label: 'Home - Story Art Visual' },
    { value: 'home_story_workshops', label: 'Home - Story Workshops Visual' },
    { value: 'home_story_franchise', label: 'Home - Story Franchise Visual' },
    { value: 'about_hero_background', label: 'About - Hero Background' },
    { value: 'why_robusta_hero_background', label: 'Why Robusta - Hero Background' },
    { value: 'franchise_hero_background', label: 'Franchise - Hero Background' },
    { value: 'art_hero_background', label: 'Art Gallery - Hero Background' },
    { value: 'coffee_hero_background', label: 'Coffee - Hero Background' },
    { value: 'workshops_hero_background', label: 'Workshops - Hero Background' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Site Media Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingMedia(null);
            setFormData({
              page: 'home',
              section: 'home_hero_background',
              label: '',
              mediaType: 'image',
              url: '',
              cloudinary_public_id: '',
              usage: 'background',
              order: 0,
              isActive: true,
            });
          }}
          className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Add Media
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-coffee-brown/20 rounded-lg p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Page *</label>
              <select
                required
                value={formData.page}
                onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="home">Home</option>
                <option value="about">About</option>
                <option value="why-robusta">Why Robusta</option>
                <option value="coffee">Coffee</option>
                <option value="art">Art</option>
                <option value="workshops">Workshops</option>
                <option value="franchise">Franchise</option>
              </select>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Section *</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 mb-2"
              >
                {knownSections.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
                <option value={formData.section}>Custom: {formData.section}</option>
              </select>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="custom_section_identifier"
                className="w-full bg-coffee-brown/40 border border-dashed border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Label (Admin only)</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Media Type *</label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Usage (optional)</label>
              <input
                type="text"
                value={formData.usage}
                onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                placeholder="background, thumbnail, gallery..."
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* Upload widgets */}
          {formData.mediaType === 'image' ? (
            <ImageUpload
              onUploadComplete={handleImageUpload}
              folder="rabuste-coffee/site-media"
              existingUrl={formData.url}
            />
          ) : (
            <VideoUpload
              onUploadComplete={handleVideoUpload}
              folder="rabuste-coffee/site-media/videos"
              existingUrl={formData.url}
            />
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-coffee-amber font-semibold">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold">
              {editingMedia ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingMedia(null);
              }}
              className="bg-coffee-brown/40 text-coffee-cream px-6 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((entry) => (
          <div key={entry._id} className="bg-coffee-brown/20 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-coffee-light/70 uppercase tracking-wide">
                  {entry.page} · {entry.section}
                </p>
                <h3 className="text-lg font-display font-bold text-coffee-amber">
                  {entry.label || entry.usage || 'Untitled media'}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                entry.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {entry.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div className="mb-3">
              {entry.mediaType === 'image' ? (
                <img
                  src={entry.url}
                  alt={entry.label || entry.section}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={entry.url}
                  controls
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
            </div>
            <p className="text-xs text-coffee-light/70 mb-3">
              Type: {entry.mediaType} · Order: {entry.order ?? 0}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(entry)}
                className="flex-1 bg-coffee-amber text-coffee-darker px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(entry._id)}
                className="flex-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Customer Engagement Component
const CustomerEngagement = ({ stats, onRefresh }) => {
  const [notifying, setNotifying] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [contentId, setContentId] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [coffees, setCoffees] = useState([]);
  const [offers, setOffers] = useState([]);
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    fetchCoffees();
    fetchOffers();
    fetchWorkshops();
  }, []);

  const fetchCoffees = async () => {
    try {
      const response = await api.get('/coffee');
      setCoffees(response.data);
    } catch (error) {
      console.error('Error fetching coffees:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await api.get('/offers');
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const response = await api.get('/workshops');
      setWorkshops(response.data);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  const handleNotifySubscribers = async () => {
    if (!notificationType || !contentId) {
      toast.error('Please select notification type and content');
      return;
    }

    if (!window.confirm(`Send email notification to all subscribed customers about this ${notificationType}?`)) {
      return;
    }

    setNotifying(true);
    try {
      const response = await api.post('/admin/customer-engagement/notify-subscribers', {
        type: notificationType,
        contentId,
        filterTags: filterTags.length > 0 ? filterTags : undefined
      });

      toast.success(response.data.message);
      setNotificationType('');
      setContentId('');
      setFilterTags([]);
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setNotifying(false);
    }
  };

  const availableTags = [
    { value: 'new_customer', label: 'New Customers' },
    { value: 'returning_customer', label: 'Returning Customers' },
    { value: 'coffee_lover', label: 'Coffee Lovers' },
    { value: 'workshop_interested', label: 'Workshop Interested' },
    { value: 'high_value', label: 'High Value' },
    { value: 'inactive_30_days', label: 'Inactive 30+ Days' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Customer Engagement</h2>
        <button
          onClick={onRefresh}
          className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Refresh Stats
        </button>
      </div>

      {/* Statistics */}
      {stats ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-coffee-brown/20 rounded-lg p-6">
            <h3 className="text-coffee-light text-sm mb-2">Total Customers</h3>
            <p className="text-3xl font-bold text-coffee-amber">{stats.totalCustomers}</p>
          </div>
          <div className="bg-coffee-brown/20 rounded-lg p-6">
            <h3 className="text-coffee-light text-sm mb-2">Subscribed Customers</h3>
            <p className="text-3xl font-bold text-coffee-amber">{stats.subscribedCustomers}</p>
            <p className="text-sm text-coffee-light mt-2">{stats.subscribedPercentage}% of total</p>
          </div>
          <div className="bg-coffee-brown/20 rounded-lg p-6">
            <h3 className="text-coffee-light text-sm mb-2">Coffee Lovers</h3>
            <p className="text-3xl font-bold text-coffee-amber">{stats.tagBreakdown?.coffee_lover || 0}</p>
          </div>
          <div className="bg-coffee-brown/20 rounded-lg p-6">
            <h3 className="text-coffee-light text-sm mb-2">Workshop Interested</h3>
            <p className="text-3xl font-bold text-coffee-amber">{stats.tagBreakdown?.workshop_interested || 0}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-coffee-amber text-xl mb-2">Loading stats...</div>
        </div>
      )}

      {/* Tag Breakdown */}
      {stats && (
        <div className="bg-coffee-brown/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-display font-bold text-coffee-amber mb-4">Tag Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {availableTags.map(tag => (
              <div key={tag.value} className="bg-coffee-brown/40 rounded p-4">
                <p className="text-coffee-light text-sm mb-1">{tag.label}</p>
                <p className="text-2xl font-bold text-coffee-amber">{stats.tagBreakdown?.[tag.value] || 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Notification Trigger */}
      <div className="bg-coffee-brown/20 rounded-lg p-6">
        <h3 className="text-xl font-display font-bold text-coffee-amber mb-4">Manual Email Notification</h3>
        <p className="text-coffee-light text-sm mb-4">
          Send email notifications to subscribed customers. Emails are sent automatically when you create new content, but you can also trigger them manually here.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Notification Type *</label>
            <select
              value={notificationType}
              onChange={(e) => {
                setNotificationType(e.target.value);
                setContentId('');
              }}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            >
              <option value="">Select type</option>
              <option value="coffee">New Coffee Item</option>
              <option value="offer">Daily Offer</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>

          {notificationType === 'coffee' && (
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Select Coffee Item *</label>
              <select
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="">Select coffee</option>
                {coffees.filter(c => c.category === 'Coffee').map(coffee => (
                  <option key={coffee._id} value={coffee._id}>{coffee.name}</option>
                ))}
              </select>
            </div>
          )}

          {notificationType === 'offer' && (
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Select Offer *</label>
              <select
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="">Select offer</option>
                {offers.map(offer => (
                  <option key={offer._id} value={offer._id}>{offer.title}</option>
                ))}
              </select>
            </div>
          )}

          {notificationType === 'workshop' && (
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Select Workshop *</label>
              <select
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="">Select workshop</option>
                {workshops.map(workshop => (
                  <option key={workshop._id} value={workshop._id}>{workshop.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Filter by Tags (Optional)</label>
            <p className="text-xs text-coffee-light/70 mb-2">Leave empty to send to all subscribed customers</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <label key={tag.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterTags.includes(tag.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterTags([...filterTags, tag.value]);
                      } else {
                        setFilterTags(filterTags.filter(t => t !== tag.value));
                      }
                    }}
                    className="w-4 h-4 text-coffee-amber bg-coffee-brown/40 border-coffee-brown rounded"
                  />
                  <span className="text-sm text-coffee-light">{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleNotifySubscribers}
            disabled={notifying || !notificationType || !contentId}
            className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {notifying ? 'Sending...' : 'Notify Subscribers'}
          </button>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-8 bg-coffee-brown/10 border border-coffee-brown/50 rounded-lg p-4">
        <h4 className="text-coffee-amber font-semibold mb-2">📧 Email System Notes</h4>
        <ul className="text-sm text-coffee-light space-y-1 list-disc list-inside">
          <li>Emails are sent automatically when you create new coffee items, offers, or workshops</li>
          <li>Only customers with marketing consent (checked during order) receive emails</li>
          <li>Customers can unsubscribe at any time via the link in emails</li>
          <li>No spam - we respect user consent strictly</li>
          <li>Tag-based filtering helps target relevant customers</li>
        </ul>
      </div>
    </div>
  );
};

// Billing Management Component
const BillingManagement = ({ billingSettings, billingOffers, loading, onRefreshSettings, onRefreshOffers }) => {
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [preorderSettings, setPreorderSettings] = useState(null);
  const [preorderFormData, setPreorderFormData] = useState({
    isEnabled: true,
    message: "Currently we're not accepting any preorder. Kindly check later.",
    customerSupportNumber: 'XXX-XXX-XXXX'
  });
  const [settingsFormData, setSettingsFormData] = useState({
    cgstRate: 2.5,
    sgstRate: 2.5,
    taxCalculationMethod: 'onSubtotal'
  });
  const [offerFormData, setOfferFormData] = useState({
    name: '',
    description: '',
    offerType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    applicableCategories: [],
    applicableItems: [],
    startDate: '',
    endDate: '',
    applicableDays: [],
    isActive: true,
    priority: 0
  });

  useEffect(() => {
    if (billingSettings) {
      setSettingsFormData({
        cgstRate: billingSettings.cgstRate || 2.5,
        sgstRate: billingSettings.sgstRate || 2.5,
        taxCalculationMethod: billingSettings.taxCalculationMethod || 'onSubtotal'
      });
    }
  }, [billingSettings]);

  useEffect(() => {
    const fetchPreorderSettings = async () => {
      try {
        const response = await api.get('/billing/preorder-settings');
        setPreorderSettings(response.data);
        setPreorderFormData({
          isEnabled: response.data.isEnabled !== false,
          message: response.data.message || "Currently we're not accepting any preorder. Kindly check later.",
          customerSupportNumber: response.data.customerSupportNumber || 'XXX-XXX-XXXX'
        });
      } catch (error) {
        console.error('Error fetching preorder settings:', error);
      }
    };
    fetchPreorderSettings();
  }, []);

  const handlePreorderSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/billing/preorder-settings', preorderFormData);
      toast.success('Preorder settings updated successfully!');
      const response = await api.get('/billing/preorder-settings');
      setPreorderSettings(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating preorder settings');
      console.error(error);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure values are properly formatted as numbers
      const payload = {
        cgstRate: parseFloat(settingsFormData.cgstRate) || 0,
        sgstRate: parseFloat(settingsFormData.sgstRate) || 0,
        taxCalculationMethod: settingsFormData.taxCalculationMethod || 'onSubtotal'
      };
      
      await api.put('/billing/settings', payload);
      toast.success('Billing settings updated successfully!');
      onRefreshSettings();
      setShowSettingsForm(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error updating billing settings';
      toast.error(errorMessage);
      console.error('Billing settings error:', error);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...offerFormData,
        discountValue: Number(offerFormData.discountValue),
        minOrderAmount: Number(offerFormData.minOrderAmount) || 0,
        maxDiscountAmount: offerFormData.maxDiscountAmount ? Number(offerFormData.maxDiscountAmount) : null,
        priority: Number(offerFormData.priority) || 0,
        startDate: new Date(offerFormData.startDate),
        endDate: new Date(offerFormData.endDate)
      };

      if (editingOffer) {
        await api.put(`/billing/offers/${editingOffer._id}`, payload);
      } else {
        await api.post('/billing/offers', payload);
      }
      toast.success('Offer saved successfully!');
      setShowOfferForm(false);
      setEditingOffer(null);
      resetOfferForm();
      onRefreshOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving offer');
      console.error(error);
    }
  };

  const resetOfferForm = () => {
    setOfferFormData({
      name: '',
      description: '',
      offerType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      applicableCategories: [],
      applicableItems: [],
      startDate: '',
      endDate: '',
      applicableDays: [],
      isActive: true,
      priority: 0
    });
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferFormData({
      name: offer.name || '',
      description: offer.description || '',
      offerType: offer.offerType || 'percentage',
      discountValue: offer.discountValue?.toString() || '',
      minOrderAmount: offer.minOrderAmount?.toString() || '',
      maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
      applicableCategories: offer.applicableCategories || [],
      applicableItems: offer.applicableItems || [],
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
      applicableDays: offer.applicableDays || [],
      isActive: offer.isActive ?? true,
      priority: offer.priority || 0
    });
    setShowOfferForm(true);
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await api.delete(`/billing/offers/${id}`);
      onRefreshOffers();
    } catch (error) {
      toast.error('Error deleting offer');
      console.error(error);
    }
  };

  const categories = ['Coffee', 'Tea', 'Shakes', 'Sides'];
  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <div>
      {/* Billing Settings Section */}
      <div className="bg-coffee-brown/20 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-bold text-coffee-amber">Billing Settings</h2>
          <button
            onClick={() => setShowSettingsForm(!showSettingsForm)}
            className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
          >
            {showSettingsForm ? 'Cancel' : 'Edit Settings'}
          </button>
        </div>

        {!showSettingsForm && billingSettings && (
          <div className="space-y-3">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-coffee-brown/40 rounded p-4">
                <p className="text-coffee-light text-sm mb-1">CGST Rate</p>
                <p className="text-2xl font-bold text-coffee-amber">{billingSettings.cgstRate}%</p>
              </div>
              <div className="bg-coffee-brown/40 rounded p-4">
                <p className="text-coffee-light text-sm mb-1">SGST Rate</p>
                <p className="text-2xl font-bold text-coffee-amber">{billingSettings.sgstRate}%</p>
              </div>
              <div className="bg-coffee-brown/40 rounded p-4">
                <p className="text-coffee-light text-sm mb-1">Total GST</p>
                <p className="text-2xl font-bold text-coffee-amber">
                  {(billingSettings.cgstRate + billingSettings.sgstRate).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="bg-coffee-brown/40 rounded p-4">
              <p className="text-coffee-light text-sm mb-1">Tax Calculation Method</p>
              <p className="text-lg font-semibold text-coffee-amber">
                {billingSettings.taxCalculationMethod === 'onSubtotal' 
                  ? 'Tax on Subtotal (Before Discount)' 
                  : 'Tax on Discounted Subtotal (After Discount)'}
              </p>
            </div>
          </div>
        )}

        {showSettingsForm && (
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">CGST Rate (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={settingsFormData.cgstRate}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, cgstRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">SGST Rate (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={settingsFormData.sgstRate}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, sgstRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Tax Calculation Method *</label>
              <select
                required
                value={settingsFormData.taxCalculationMethod}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, taxCalculationMethod: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              >
                <option value="onSubtotal">Tax on Subtotal (Before Discount)</option>
                <option value="onDiscountedSubtotal">Tax on Discounted Subtotal (After Discount)</option>
              </select>
              <p className="text-xs text-coffee-light/70 mt-1">
                {settingsFormData.taxCalculationMethod === 'onSubtotal'
                  ? 'Tax will be calculated on the original subtotal before any discounts are applied.'
                  : 'Tax will be calculated on the subtotal after discounts are applied.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsForm(false)}
                className="bg-coffee-brown/40 text-coffee-cream px-6 py-2 rounded-lg font-semibold hover:bg-coffee-brown/60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Daily Offers Section */}
      <div className="bg-coffee-brown/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold text-coffee-amber">Daily Offers</h2>
          <button
            onClick={() => {
              setShowOfferForm(true);
              setEditingOffer(null);
              resetOfferForm();
            }}
            className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
          >
            Add Offer
          </button>
        </div>

        {showOfferForm && (
          <form onSubmit={handleOfferSubmit} className="bg-coffee-brown/30 rounded-lg p-6 mb-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Offer Name *</label>
                <input
                  type="text"
                  required
                  value={offerFormData.name}
                  onChange={(e) => setOfferFormData({ ...offerFormData, name: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Offer Type *</label>
                <select
                  required
                  value={offerFormData.offerType}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offerType: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Description</label>
              <textarea
                rows="2"
                value={offerFormData.description}
                onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Discount Value {offerFormData.offerType === 'percentage' ? '(%)' : '(₹)'} *
                </label>
                <input
                  type="number"
                  step={offerFormData.offerType === 'percentage' ? '0.1' : '1'}
                  min="0"
                  max={offerFormData.offerType === 'percentage' ? '100' : undefined}
                  required
                  value={offerFormData.discountValue}
                  onChange={(e) => setOfferFormData({ ...offerFormData, discountValue: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Min Order Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={offerFormData.minOrderAmount}
                  onChange={(e) => setOfferFormData({ ...offerFormData, minOrderAmount: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              {offerFormData.offerType === 'percentage' && (
                <div>
                  <label className="block text-coffee-amber font-semibold mb-2">Max Discount (₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={offerFormData.maxDiscountAmount}
                    onChange={(e) => setOfferFormData({ ...offerFormData, maxDiscountAmount: e.target.value })}
                    className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                    placeholder="No limit"
                  />
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Start Date *</label>
                <input
                  type="date"
                  required
                  value={offerFormData.startDate}
                  onChange={(e) => setOfferFormData({ ...offerFormData, startDate: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">End Date *</label>
                <input
                  type="date"
                  required
                  value={offerFormData.endDate}
                  onChange={(e) => setOfferFormData({ ...offerFormData, endDate: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Applicable Categories</label>
              <p className="text-xs text-coffee-light/70 mb-2">Leave empty to apply to all categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerFormData.applicableCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOfferFormData({
                            ...offerFormData,
                            applicableCategories: [...offerFormData.applicableCategories, cat]
                          });
                        } else {
                          setOfferFormData({
                            ...offerFormData,
                            applicableCategories: offerFormData.applicableCategories.filter(c => c !== cat)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-coffee-light">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">Applicable Days</label>
              <p className="text-xs text-coffee-light/70 mb-2">Leave empty to apply to all days</p>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerFormData.applicableDays.includes(day.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOfferFormData({
                            ...offerFormData,
                            applicableDays: [...offerFormData.applicableDays, day.value]
                          });
                        } else {
                          setOfferFormData({
                            ...offerFormData,
                            applicableDays: offerFormData.applicableDays.filter(d => d !== day.value)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-coffee-light">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offerFormData.isActive}
                  onChange={(e) => setOfferFormData({ ...offerFormData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-coffee-light">Active</span>
              </label>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">Priority</label>
                <input
                  type="number"
                  min="0"
                  value={offerFormData.priority}
                  onChange={(e) => setOfferFormData({ ...offerFormData, priority: parseInt(e.target.value) || 0 })}
                  className="w-24 bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                />
                <p className="text-xs text-coffee-light/70 mt-1">Higher number = higher priority</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
              >
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOfferForm(false);
                  setEditingOffer(null);
                  resetOfferForm();
                }}
                className="bg-coffee-brown/40 text-coffee-cream px-6 py-2 rounded-lg font-semibold hover:bg-coffee-brown/60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && billingOffers.length === 0 ? (
          <div className="text-coffee-light">Loading offers...</div>
        ) : billingOffers.length === 0 ? (
          <div className="text-center py-8 text-coffee-light">No offers created yet</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {billingOffers.map(offer => (
              <div key={offer._id} className="bg-coffee-brown/40 rounded-lg p-4 border border-coffee-brown/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-coffee-amber">{offer.name}</h3>
                    {offer.description && (
                      <p className="text-sm text-coffee-light/80 mt-1">{offer.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    offer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-coffee-light mb-3">
                  <p>
                    <span className="font-semibold">Discount:</span>{' '}
                    {offer.offerType === 'percentage' 
                      ? `${offer.discountValue}%` 
                      : `₹${offer.discountValue}`}
                    {offer.offerType === 'percentage' && offer.maxDiscountAmount && (
                      <span> (Max ₹{offer.maxDiscountAmount})</span>
                    )}
                  </p>
                  {offer.minOrderAmount > 0 && (
                    <p><span className="font-semibold">Min Order:</span> ₹{offer.minOrderAmount}</p>
                  )}
                  <p>
                    <span className="font-semibold">Valid:</span>{' '}
                    {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                  </p>
                  {offer.applicableCategories.length > 0 && (
                    <p><span className="font-semibold">Categories:</span> {offer.applicableCategories.join(', ')}</p>
                  )}
                  {offer.applicableDays.length > 0 && (
                    <p>
                      <span className="font-semibold">Days:</span>{' '}
                      {offer.applicableDays.map(d => daysOfWeek.find(day => day.value === d)?.label).filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditOffer(offer)}
                    className="flex-1 bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg text-sm font-semibold hover:bg-coffee-gold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteOffer(offer._id)}
                    className="flex-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preorder Settings Section */}
      <div className="bg-coffee-brown/20 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-display font-bold text-coffee-amber mb-4">Preorder Settings</h2>
        
        {preorderSettings && (
          <form onSubmit={handlePreorderSettingsSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preorderFormData.isEnabled}
                  onChange={(e) => setPreorderFormData({ ...preorderFormData, isEnabled: e.target.checked })}
                  className="w-5 h-5 text-coffee-amber bg-coffee-brown/40 border-coffee-brown rounded focus:ring-coffee-amber"
                />
                <span className="text-coffee-cream font-semibold">
                  Enable Preorder
                </span>
              </label>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                preorderFormData.isEnabled 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {preorderFormData.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div>
              <label className="block text-coffee-amber font-semibold mb-2">
                Message When Disabled
              </label>
              <textarea
                value={preorderFormData.message}
                onChange={(e) => setPreorderFormData({ ...preorderFormData, message: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                rows="3"
                placeholder="Message to show when preorder is disabled"
              />
            </div>

            <div>
              <label className="block text-coffee-amber font-semibold mb-2">
                Customer Support Number
              </label>
              <input
                type="text"
                value={preorderFormData.customerSupportNumber}
                onChange={(e) => setPreorderFormData({ ...preorderFormData, customerSupportNumber: e.target.value })}
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                placeholder="XXX-XXX-XXXX"
              />
              <p className="text-coffee-light/60 text-sm mt-1">
                This number will be included in cancellation emails sent to customers.
              </p>
            </div>

            <button
              type="submit"
              className="bg-coffee-amber text-coffee-darker px-6 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
            >
              Save Preorder Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Art Orders Management Component
const ArtOrdersManagement = ({ orders, loading, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === filterStatus);

  const handleAccept = async (orderId) => {
    if (!window.confirm('Are you sure you want to accept this order?')) return;
    
    try {
      await api.post(`/art-orders/${orderId}/accept`);
      toast.success('Order accepted successfully!');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      await api.post(`/art-orders/${selectedOrder._id}/cancel`, { reason: cancelReason });
      toast.success('Order cancelled and refund processed');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedOrder(null);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'confirmed': 'bg-green-500/20 text-green-400',
      'cancelled': 'bg-red-500/20 text-red-400',
      'shipped': 'bg-blue-500/20 text-blue-400',
      'delivered': 'bg-green-500/20 text-green-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Art Orders</h2>
        <button
          onClick={onRefresh}
          className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === status
                ? 'bg-coffee-amber text-coffee-darker'
                : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-coffee-light">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-coffee-light">No orders found</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-coffee-amber mb-2">
                    Order #{order.orderNumber}
                  </h3>
                  {order.artworkId && (
                    <div className="flex gap-4">
                      {order.artworkId.image && (
                        <img
                          src={order.artworkId.image}
                          alt={order.artworkId.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="text-coffee-cream font-semibold">{order.artworkId.title}</p>
                        <p className="text-coffee-light text-sm">by {order.artworkId.artistName}</p>
                        <p className="text-coffee-amber font-bold">₹{order.price}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-coffee-light text-sm mb-1">Customer</p>
                  <p className="text-coffee-cream font-semibold">{order.customerName}</p>
                  <p className="text-coffee-light text-sm">{order.email}</p>
                  <p className="text-coffee-light text-sm">{order.phone}</p>
                  <p className="text-coffee-light text-sm mt-2">
                    {order.address}, {order.city} - {order.pincode}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
                {order.trackingNumber && (
                  <span className="text-coffee-light text-sm">
                    Tracking: {order.trackingNumber}
                  </span>
                )}
              </div>

              {order.orderStatus === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(order._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowCancelModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-coffee-amber mb-4">Cancel Order</h3>
            <p className="text-coffee-light mb-4">
              Please provide a reason for cancelling order #{selectedOrder?.orderNumber}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 mb-4"
              rows="3"
              placeholder="Cancellation reason..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Cancel Order & Refund
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedOrder(null);
                }}
                className="flex-1 bg-coffee-brown/40 text-coffee-cream px-4 py-2 rounded-lg font-semibold hover:bg-coffee-brown/60"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Artist Requests Management Component
const ArtistRequestsManagement = ({ requests, loading, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNeedsInfoModal, setShowNeedsInfoModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [needsInfoMessage, setNeedsInfoMessage] = useState('');
  const [approveFormData, setApproveFormData] = useState({
    price: '',
    description: '',
    dimensions: ''
  });

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(req => req.status === filterStatus);

  const handleApprove = async () => {
    if (!approveFormData.price || !approveFormData.description) {
      toast.error('Price and description are required');
      return;
    }

    try {
      await api.post(`/artist-requests/${selectedRequest._id}/approve`, approveFormData);
      toast.success('Artist request approved and artwork created!');
      setShowApproveModal(false);
      setSelectedRequest(null);
      setApproveFormData({ price: '', description: '', dimensions: '' });
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await api.post(`/artist-requests/${selectedRequest._id}/reject`, { reason: rejectReason });
      toast.success('Request rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleNeedsInfo = async () => {
    if (!needsInfoMessage.trim()) {
      toast.error('Please provide a message');
      return;
    }

    try {
      await api.post(`/artist-requests/${selectedRequest._id}/needs-info`, { message: needsInfoMessage });
      toast.success('Request marked as needs more info');
      setShowNeedsInfoModal(false);
      setNeedsInfoMessage('');
      setSelectedRequest(null);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'approved': 'bg-green-500/20 text-green-400',
      'rejected': 'bg-red-500/20 text-red-400',
      'needs_info': 'bg-blue-500/20 text-blue-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Artist Requests</h2>
        <button
          onClick={onRefresh}
          className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected', 'needs_info'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === status
                ? 'bg-coffee-amber text-coffee-darker'
                : 'bg-coffee-brown/40 text-coffee-cream hover:bg-coffee-brown/60'
            }`}
          >
            {status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-coffee-light">Loading requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-coffee-light">No requests found</div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request._id} className="bg-coffee-brown/20 rounded-lg p-6 border border-coffee-brown/50">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-coffee-amber mb-2">
                    {request.artworkTitle}
                  </h3>
                  <p className="text-coffee-light text-sm mb-1">by {request.artistName}</p>
                  <p className="text-coffee-light text-sm">Medium: {request.medium}</p>
                  <p className="text-coffee-amber font-bold mt-2">
                    Expected Price: ₹{request.priceExpectation}
                  </p>
                  {request.artworkStory && (
                    <p className="text-coffee-light text-sm mt-2">{request.artworkStory}</p>
                  )}
                </div>
                <div>
                  <p className="text-coffee-light text-sm mb-1">Contact</p>
                  <p className="text-coffee-cream font-semibold">{request.email}</p>
                  <p className="text-coffee-light text-sm">{request.phone}</p>
                  
                  {request.images && request.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {request.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Artwork ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                {request.convertedArtworkId && (
                  <span className="text-coffee-amber text-sm">
                    ✓ Converted to Artwork
                  </span>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowApproveModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowNeedsInfoModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Needs More Info
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-coffee-amber mb-4">Approve Artist Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  value={approveFormData.price}
                  onChange={(e) => setApproveFormData({ ...approveFormData, price: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="Enter selling price"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  value={approveFormData.description}
                  onChange={(e) => setApproveFormData({ ...approveFormData, description: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  rows="4"
                  placeholder="Artwork description..."
                />
              </div>
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Dimensions (optional)
                </label>
                <input
                  type="text"
                  value={approveFormData.dimensions}
                  onChange={(e) => setApproveFormData({ ...approveFormData, dimensions: e.target.value })}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                  placeholder="e.g., 24x36 inches"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Approve & Create Artwork
                </button>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                    setApproveFormData({ price: '', description: '', dimensions: '' });
                  }}
                  className="flex-1 bg-coffee-brown/40 text-coffee-cream px-4 py-2 rounded-lg font-semibold hover:bg-coffee-brown/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-coffee-amber mb-4">Reject Artist Request</h3>
            <p className="text-coffee-light mb-4">
              Please provide a reason for rejecting the request for "{selectedRequest.artworkTitle}"
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 mb-4"
              rows="4"
              placeholder="Rejection reason..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Reject Request
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequest(null);
                }}
                className="flex-1 bg-coffee-brown/40 text-coffee-cream px-4 py-2 rounded-lg font-semibold hover:bg-coffee-brown/60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Needs Info Modal */}
      {showNeedsInfoModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-coffee-amber mb-4">Request More Information</h3>
            <p className="text-coffee-light mb-4">
              What additional information is needed for "{selectedRequest.artworkTitle}"?
            </p>
            <textarea
              value={needsInfoMessage}
              onChange={(e) => setNeedsInfoMessage(e.target.value)}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 mb-4"
              rows="4"
              placeholder="Please specify what information is needed..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleNeedsInfo}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Send Request
              </button>
              <button
                onClick={() => {
                  setShowNeedsInfoModal(false);
                  setNeedsInfoMessage('');
                  setSelectedRequest(null);
                }}
                className="flex-1 bg-coffee-brown/40 text-coffee-cream px-4 py-2 rounded-lg font-semibold hover:bg-coffee-brown/60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

