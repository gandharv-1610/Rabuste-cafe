import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ArtistSubmission = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    phone: '',
    artworkTitle: '',
    medium: '',
    priceExpectation: '',
    artworkStory: ''
  });
  const [images, setImages] = useState([]);
  const [cloudinaryPublicIds, setCloudinaryPublicIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.artistName.trim()) {
      newErrors.artistName = 'Artist name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.artworkTitle.trim()) {
      newErrors.artworkTitle = 'Artwork title is required';
    }
    if (!formData.medium.trim()) {
      newErrors.medium = 'Medium is required';
    }
    if (!formData.priceExpectation.trim()) {
      newErrors.priceExpectation = 'Price expectation is required';
    } else if (isNaN(formData.priceExpectation) || parseFloat(formData.priceExpectation) <= 0) {
      newErrors.priceExpectation = 'Please enter a valid price';
    }
    if (images.length === 0) {
      newErrors.images = 'At least one artwork image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Please select only image files');
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('File size must be less than 10MB per image');
      return;
    }

    setUploading(true);
    const uploadedImages = [];
    const uploadedPublicIds = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', 'artist-submissions');

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        uploadedImages.push(response.data.url);
        if (response.data.public_id) {
          uploadedPublicIds.push(response.data.public_id);
        }
      }

      setImages([...images, ...uploadedImages]);
      setCloudinaryPublicIds([...cloudinaryPublicIds, ...uploadedPublicIds]);
      toast.success(`Successfully uploaded ${uploadedImages.length} image(s)`);
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setCloudinaryPublicIds(cloudinaryPublicIds.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/artist-requests/submit', {
        ...formData,
        priceExpectation: parseFloat(formData.priceExpectation),
        images,
        cloudinary_public_ids: cloudinaryPublicIds
      });

      toast.success('Your submission has been received! We\'ll review it and get back to you soon.');
      navigate('/art-gallery');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-coffee-darkest py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8"
        >
          <h1 className="text-3xl font-heading font-bold text-coffee-amber mb-2">
            Partner with Rabuste Coffee
          </h1>
          <p className="text-coffee-light mb-8">
            Submit your artwork to be featured in our café gallery
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Artist Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.artistName ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="Your name"
                />
                {errors.artistName && (
                  <p className="text-red-400 text-sm mt-1">{errors.artistName}</p>
                )}
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.email ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-coffee-amber font-semibold mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className={`w-full bg-coffee-brown/40 border ${
                  errors.phone ? 'border-red-500' : 'border-coffee-brown'
                } text-coffee-cream rounded-lg px-4 py-2`}
                placeholder="10-digit mobile number"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Artwork Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  value={formData.artworkTitle}
                  onChange={(e) => setFormData({ ...formData, artworkTitle: e.target.value })}
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.artworkTitle ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="Title of your artwork"
                />
                {errors.artworkTitle && (
                  <p className="text-red-400 text-sm mt-1">{errors.artworkTitle}</p>
                )}
              </div>

              <div>
                <label className="block text-coffee-amber font-semibold mb-2">
                  Medium *
                </label>
                <input
                  type="text"
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                  className={`w-full bg-coffee-brown/40 border ${
                    errors.medium ? 'border-red-500' : 'border-coffee-brown'
                  } text-coffee-cream rounded-lg px-4 py-2`}
                  placeholder="e.g., Canvas, Digital, Sculpture"
                />
                {errors.medium && (
                  <p className="text-red-400 text-sm mt-1">{errors.medium}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-coffee-amber font-semibold mb-2">
                Price Expectation (₹) *
              </label>
              <input
                type="number"
                value={formData.priceExpectation}
                onChange={(e) => setFormData({ ...formData, priceExpectation: e.target.value })}
                className={`w-full bg-coffee-brown/40 border ${
                  errors.priceExpectation ? 'border-red-500' : 'border-coffee-brown'
                } text-coffee-cream rounded-lg px-4 py-2`}
                placeholder="Expected selling price"
                min="0"
                step="0.01"
              />
              {errors.priceExpectation && (
                <p className="text-red-400 text-sm mt-1">{errors.priceExpectation}</p>
              )}
            </div>

            <div>
              <label className="block text-coffee-amber font-semibold mb-2">
                Story About Your Artwork
              </label>
              <textarea
                value={formData.artworkStory}
                onChange={(e) => setFormData({ ...formData, artworkStory: e.target.value })}
                rows="4"
                className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2"
                placeholder="Tell us the story behind your artwork..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-coffee-amber font-semibold mb-2">
                Artwork Photos * (At least 1 required)
              </label>
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploading && (
                  <p className="text-coffee-amber text-sm mt-2">Uploading images...</p>
                )}
                <p className="text-coffee-light/60 text-xs mt-1">
                  You can select multiple images. Each image must be less than 10MB.
                </p>
              </div>
              {errors.images && (
                <p className="text-red-400 text-sm mt-1">{errors.images}</p>
              )}
              
              {/* Display uploaded images */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Artwork ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/art-gallery')}
                className="flex-1 bg-coffee-brown/40 text-coffee-cream py-3 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtistSubmission;

