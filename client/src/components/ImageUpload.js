import React, { useState } from 'react';
import api from '../api/axios';

const ImageUpload = ({ onUploadComplete, folder = 'rabuste-coffee', existingUrl = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingUrl);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUploadComplete({
        url: response.data.url,
        cloudinary_url: response.data.url,
        cloudinary_public_id: response.data.public_id
      });
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-coffee-amber font-semibold mb-2">
        Photo {existingUrl && '(Click to change)'}
      </label>
      <div className="mb-4">
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber disabled:opacity-50"
        />
      </div>
      {uploading && (
        <p className="text-coffee-amber text-sm">Uploading...</p>
      )}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;

