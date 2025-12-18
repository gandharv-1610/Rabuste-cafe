import React from 'react';

const VideoPlayer = ({ videoUrl, autoplay = true, className = '' }) => {

  if (!videoUrl) return null;

  return (
    <div className={`relative ${className}`}>
      <video
        src={videoUrl}
        autoPlay={autoplay}
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoPlayer;

