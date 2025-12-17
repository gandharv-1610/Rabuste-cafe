import React, { useState } from 'react';
import api from '../api/axios';

const VideoUpload = ({ onUploadComplete, folder = 'rabuste-coffee/videos', existingUrl = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingUrl);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError('');
    setUploading(true);

    // Create preview
    const videoUrl = URL.createObjectURL(file);
    setPreview(videoUrl);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('folder', folder);

      const response = await api.post('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Clean up preview URL
      URL.revokeObjectURL(videoUrl);

      onUploadComplete({
        url: response.data.url,
        cloudinary_video_url: response.data.url,
        cloudinary_video_public_id: response.data.public_id
      });
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
      URL.revokeObjectURL(videoUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-coffee-amber font-semibold mb-2">
        Video {existingUrl && '(Click to change)'}
      </label>
      <div className="mb-4">
        {preview && (
          <video
            src={preview}
            controls
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
        )}
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-amber disabled:opacity-50"
        />
      </div>
      {uploading && (
        <p className="text-coffee-amber text-sm">Uploading video... This may take a while.</p>
      )}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

export default VideoUpload;

