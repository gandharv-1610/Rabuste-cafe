import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const InfiniteSlider = ({ items, title, onNavigate, speed = 0.5 }) => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
      if (items.length > 0) {
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
  }, [items, speed]);

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
    >
      <h2 className="text-4xl font-heading font-bold text-coffee-amber mb-8 text-center">
        {title}
      </h2>
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-hidden pb-4 scrollbar-hide cursor-pointer"
        onClick={onNavigate}
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
          
          return (
            <motion.div
              key={`${item._id}-${idx}`}
              className="flex-shrink-0 w-64 h-64 rounded-lg overflow-hidden shadow-lg transition-all duration-300 relative"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              animate={{
                scale: shouldPopUp ? 1.2 : 1,
                y: shouldPopUp ? -10 : 0,
              }}
              style={{
                transformOrigin: 'center',
                zIndex: shouldPopUp ? 10 : 1,
              }}
            >
              <img
                src={`${item.cloudinary_url || item.image}?v=${item.updatedAt || Date.now()}`}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const emoji = title === 'Coffee' ? '☕' : title === 'Shakes' ? '🥤' : '🍰';
                  e.target.parentElement.innerHTML = `<div class="w-full h-full bg-coffee-brown/40 flex items-center justify-center"><span class="text-6xl">${emoji}</span></div>`;
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteSlider;

