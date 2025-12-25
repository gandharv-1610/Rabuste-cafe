import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const InfiniteSlider = ({ items, title, onNavigate, speed = 0.5, accentColor = 'coffee' }) => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});

  // Category-specific accent colors with actual color values
  const categoryColors = {
    Coffee: {
      accentLight: '#FF8F33', // coffee-amberLight
      glow: 'rgba(255, 111, 0, 0.3)',
      gradientFrom: 'rgba(255, 111, 0, 0.2)',
      gradientVia: 'rgba(255, 111, 0, 0.1)',
      gradientTo: 'transparent'
    },
    Shakes: {
      accentLight: '#F9A8D4', // pink-300
      glow: 'rgba(244, 114, 182, 0.3)',
      gradientFrom: 'rgba(244, 114, 182, 0.2)',
      gradientVia: 'rgba(251, 168, 212, 0.1)',
      gradientTo: 'transparent'
    },
    Tea: {
      accentLight: '#86EFAC', // green-300
      glow: 'rgba(74, 222, 128, 0.3)',
      gradientFrom: 'rgba(74, 222, 128, 0.2)',
      gradientVia: 'rgba(110, 231, 183, 0.1)',
      gradientTo: 'transparent'
    },
    Sides: {
      accentLight: '#FFC233', // coffee-goldLight
      glow: 'rgba(255, 179, 0, 0.3)',
      gradientFrom: 'rgba(255, 179, 0, 0.2)',
      gradientVia: 'rgba(255, 179, 0, 0.1)',
      gradientTo: 'transparent'
    }
  };

  const colors = categoryColors[title] || categoryColors.Coffee;

  // Duplicate items for seamless infinite scroll (need enough duplicates)
  const duplicatedItems = [...items, ...items, ...items, ...items];

  useEffect(() => {
    if (!sliderRef.current || !containerRef.current || items.length === 0) return;

    const slider = sliderRef.current;
    const container = containerRef.current;
    let animationFrameId;
    let scrollPosition = 0;
    const itemWidth = 256 + 16; // w-64 (256px) + gap-4 (16px)
    const totalWidth = itemWidth * items.length;

    const updateCenterIndex = () => {
      const center = container.clientWidth / 2;
      const scrollCenter = scrollPosition + center;
      const newCenterIndex = Math.floor((scrollCenter % totalWidth) / itemWidth);
      setCenterIndex(newCenterIndex);
    };

    const animate = () => {
      if (items.length > 0 && !isPaused) {
        scrollPosition += speed;
        
        // Reset scroll position when reaching the end of first set
        if (scrollPosition >= totalWidth) {
          scrollPosition = scrollPosition % totalWidth;
        }

        slider.scrollLeft = scrollPosition;
        updateCenterIndex();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize scroll position to middle set
    scrollPosition = totalWidth;
    slider.scrollLeft = scrollPosition;
    updateCenterIndex();

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [items, speed, isPaused]);

  const handleImageLoad = (idx) => {
    setImageLoaded(prev => ({ ...prev, [idx]: true }));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-coffee-brown/20 rounded-lg">
        <p className="text-coffee-light">No items available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-hidden pb-4 scrollbar-hide"
        style={{ 
          scrollBehavior: 'auto',
          willChange: 'scroll-position'
        }}
      >
        {duplicatedItems.map((item, idx) => {
          const itemIndex = idx % items.length;
          const isCenter = itemIndex === centerIndex;
          const isHovered = hoveredIndex === idx;
          const shouldPopUp = isHovered || isCenter;
          const imageUrl = `${item.cloudinary_url || item.image}?v=${item.updatedAt || Date.now()}`;
          const isImageLoaded = imageLoaded[idx];
          
          return (
            <motion.div
              key={`${item._id}-${idx}`}
              className="flex-shrink-0 w-64 h-64 rounded-2xl overflow-hidden relative cursor-pointer group touch-manipulation"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(idx)}
              onTouchEnd={() => setTimeout(() => setHoveredIndex(null), 200)}
              onClick={onNavigate}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate();
                }
              }}
              aria-label={`View ${item.name} menu`}
              animate={{
                scale: shouldPopUp ? 1.08 : 1,
                y: shouldPopUp ? -12 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              style={{
                transformOrigin: 'center',
                zIndex: shouldPopUp ? 10 : 1,
              }}
            >
              {/* Loading Skeleton */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-coffee-brown/30 to-coffee-dark/30 animate-pulse">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                </div>
              )}

              {/* Image Container */}
              <div className="relative w-full h-full overflow-hidden">
                <motion.img
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(idx)}
                  animate={{
                    scale: isHovered ? 1.15 : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const emoji = title === 'Coffee' ? '☕' : title === 'Shakes' ? '🥤' : title === 'Tea' ? '🍵' : '🍰';
                    e.target.parentElement.innerHTML = `<div class="w-full h-full bg-coffee-brown/40 flex items-center justify-center"><span class="text-6xl">${emoji}</span></div>`;
                  }}
                />
              </div>

              {/* Gradient Overlay on Hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isHovered 
                    ? `linear-gradient(to top, ${colors.gradientFrom}, ${colors.gradientVia}, ${colors.gradientTo})`
                    : 'transparent',
                  transition: 'opacity 0.3s ease'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Dark Overlay for Better Text Contrast */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-coffee-darkest/80 via-coffee-darkest/40 to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
              />

              {/* Hover Content */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 10
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3 className="text-white font-heading font-semibold text-lg mb-1 line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium" style={{ color: colors.accentLight }}>View Menu</span>
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke={colors.accentLight}
                    viewBox="0 0 24 24"
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </div>
              </motion.div>

              {/* Accent Glow Effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: isHovered ? `0 0 30px ${colors.glow}, 0 10px 40px rgba(0,0,0,0.3)` : '0 4px 20px rgba(0,0,0,0.2)',
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteSlider;

