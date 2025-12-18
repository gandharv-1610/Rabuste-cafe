import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ImageUpload from '../components/ImageUpload';
import VideoUpload from '../components/VideoUpload';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [coffees, setCoffees] = useState([]);
  const [arts, setArts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [siteMedia, setSiteMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'coffee') fetchCoffees();
    if (activeTab === 'art') fetchArts();
    if (activeTab === 'workshops') {
      fetchWorkshops();
      fetchRegistrations();
    }
    if (activeTab === 'franchise') fetchEnquiries();
    if (activeTab === 'siteMedia') fetchSiteMedia();
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'coffee', label: 'Coffee Menu' },
    { id: 'art', label: 'Art Gallery' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'franchise', label: 'Franchise Enquiries' },
    { id: 'siteMedia', label: 'Site Media' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-coffee-darker">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold text-coffee-amber mb-8">Admin Panel</h1>

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
        {activeTab === 'dashboard' && stats && (
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
          </div>
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
            loading={loading}
            onRefresh={fetchArts}
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

        {/* Site Media Management */}
        {activeTab === 'siteMedia' && (
          <SiteMediaManagement
            media={siteMedia}
            loading={loading}
            onRefresh={fetchSiteMedia}
          />
        )}
      </div>
    </div>
  );
};

// Coffee Management Component
const CoffeeManagement = ({ coffees, loading, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Coffee',
    strength: 'Medium',
    flavorNotes: '',
    price: '',
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
      price: parseFloat(formData.price) || 0,
      flavorNotes: formData.flavorNotes.split(',').map(f => f.trim()).filter(f => f),
      // Only include strength if category is Coffee
      ...(formData.category === 'Coffee' ? { strength: formData.strength } : { strength: undefined })
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
        strength: 'Medium', 
        flavorNotes: '', 
        price: '',
        isBestseller: false,
        image: '',
        cloudinary_url: '',
        cloudinary_public_id: ''
      });
      onRefresh();
    } catch (error) {
      alert('Error saving menu item');
      console.error(error);
    }
  };

  const handleEdit = (coffee) => {
    setEditingCoffee(coffee);
    setFormData({
      name: coffee.name,
      description: coffee.description,
      category: coffee.category || 'Coffee',
      strength: coffee.strength || 'Medium',
      flavorNotes: coffee.flavorNotes?.join(', ') || '',
      price: coffee.price?.toString() || '',
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
      alert('Error deleting coffee item');
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
              strength: 'Medium', 
              flavorNotes: '', 
              price: '',
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
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            >
              <option value="Coffee">Coffee</option>
              <option value="Snacks">Snacks</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Other">Other</option>
            </select>
          </div>
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
const ArtManagement = ({ arts, loading, onRefresh }) => {
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
      alert('Error saving art piece');
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
      alert('Error deleting art piece');
    }
  };

  if (loading) return <div className="text-coffee-light">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Art Gallery Management</h2>
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
    </div>
  );
};

// Workshops Management Component
const WorkshopsManagement = ({ workshops, registrations, loading, onRefresh, onRefreshRegistrations }) => {
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
      alert('Error saving workshop');
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
      alert('Error deleting workshop');
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

      {/* Registrations */}
      <div className="mt-8">
        <h3 className="text-2xl font-display font-bold text-coffee-amber mb-4">Recent Registrations</h3>
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <p className="text-coffee-light">No registrations yet.</p>
          ) : (
            registrations.slice(0, 10).map((reg) => (
              <div key={reg._id} className="bg-coffee-brown/20 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-coffee-amber font-semibold">{reg.name}</p>
                    <p className="text-coffee-light text-sm">{reg.email} | {reg.phone}</p>
                    <p className="text-coffee-light text-sm">
                      Workshop: {reg.workshopId?.title || 'N/A'}
                    </p>
                    {reg.message && (
                      <p className="text-coffee-light text-sm mt-2 italic">"{reg.message}"</p>
                    )}
                    {reg.confirmationCode && (
                      <p className="text-coffee-light text-xs mt-1">Code: {reg.confirmationCode}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      reg.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                      reg.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {reg.status}
                    </span>
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
                            alert('Error deleting registration');
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
            ))
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
      alert('Error updating status');
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
      alert('Error saving site media');
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
      alert('Error deleting media entry');
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

export default AdminPanel;

