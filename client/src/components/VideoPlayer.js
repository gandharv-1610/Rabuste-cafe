import React from 'react';

const VideoPlayer = ({ videoUrl, autoplay = true, className = '', controls = false }) => {

  if (!videoUrl) return null;

  return (
    <div className={className}>
      <video
        src={videoUrl}
        autoPlay={autoplay}
        muted
        loop={autoplay}
        playsInline
        controls={controls}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoPlayer;

