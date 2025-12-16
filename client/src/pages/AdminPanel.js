import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [coffees, setCoffees] = useState([]);
  const [arts, setArts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'coffee', label: 'Coffee Menu' },
    { id: 'art', label: 'Art Gallery' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'franchise', label: 'Franchise Enquiries' },
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
    strength: 'Medium',
    flavorNotes: '',
    isBestseller: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const coffeeData = {
      ...formData,
      flavorNotes: formData.flavorNotes.split(',').map(f => f.trim()).filter(f => f),
    };

    try {
      if (editingCoffee) {
        await api.put(`/coffee/${editingCoffee._id}`, coffeeData);
      } else {
        await api.post('/coffee', coffeeData);
      }
      setShowForm(false);
      setEditingCoffee(null);
      setFormData({ name: '', description: '', strength: 'Medium', flavorNotes: '', isBestseller: false });
      onRefresh();
    } catch (error) {
      alert('Error saving coffee item');
    }
  };

  const handleEdit = (coffee) => {
    setEditingCoffee(coffee);
    setFormData({
      name: coffee.name,
      description: coffee.description,
      strength: coffee.strength,
      flavorNotes: coffee.flavorNotes?.join(', ') || '',
      isBestseller: coffee.isBestseller,
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
        <h2 className="text-2xl font-display font-bold text-coffee-amber">Coffee Menu Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCoffee(null);
            setFormData({ name: '', description: '', strength: 'Medium', flavorNotes: '', isBestseller: false });
          }}
          className="bg-coffee-amber text-coffee-darker px-4 py-2 rounded-lg font-semibold hover:bg-coffee-gold"
        >
          Add Coffee Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-coffee-brown/20 rounded-lg p-6 mb-6 space-y-4">
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
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Strength *</label>
            <select
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
              <h3 className="text-xl font-display font-bold text-coffee-amber">{coffee.name}</h3>
              {coffee.isBestseller && (
                <span className="bg-coffee-amber text-coffee-darker text-xs px-2 py-1 rounded">Bestseller</span>
              )}
            </div>
            <p className="text-coffee-light text-sm mb-4 line-clamp-2">{coffee.description}</p>
            <p className="text-coffee-amber text-sm mb-4">Strength: {coffee.strength}</p>
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
    availability: 'Available',
    dimensions: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const artData = { ...formData, price: parseFloat(formData.price) };

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
      image: art.image || '',
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
          <div>
            <label className="block text-coffee-amber font-semibold mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
            />
          </div>
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
            <p className="text-coffee-amber font-bold mb-2">${art.price}</p>
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
const WorkshopsManagement = ({ workshops, registrations, loading, onRefresh }) => {
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
  });

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
          {registrations.slice(0, 10).map((reg) => (
            <div key={reg._id} className="bg-coffee-brown/20 rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-coffee-amber font-semibold">{reg.name}</p>
                  <p className="text-coffee-light text-sm">{reg.email} | {reg.phone}</p>
                  <p className="text-coffee-light text-sm">
                    Workshop: {reg.workshopId?.title || 'N/A'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  reg.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                  reg.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {reg.status}
                </span>
              </div>
            </div>
          ))}
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

export default AdminPanel;

