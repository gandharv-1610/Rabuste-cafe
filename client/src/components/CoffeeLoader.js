import React from 'react';
import { motion } from 'framer-motion';

const CoffeeLoader = ({ size = 'md', className = '', showText = true }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClass} relative`}>
        {/* Coffee Cup with Steam */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cup Body */}
          <motion.path
            d="M25 45 L25 75 Q25 85 35 85 L65 85 Q75 85 75 75 L75 45 L25 45 Z"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-coffee-amber"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Cup Handle */}
          <motion.path
            d="M75 55 Q85 55 90 60 Q85 65 75 65"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-coffee-amber"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
          />
          
          {/* Coffee Liquid */}
          <motion.ellipse
            cx="50"
            cy="45"
            rx="25"
            ry="4"
            fill="currentColor"
            className="text-coffee-brown"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.8, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Steam Line 1 */}
          <motion.path
            d="M40 35 Q40 25 35 20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className="text-coffee-amber"
            initial={{ opacity: 0, pathLength: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              pathLength: [0, 1, 0],
              y: [0, -8, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          />
          
          {/* Steam Line 2 */}
          <motion.path
            d="M50 35 Q50 25 55 20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className="text-coffee-amber"
            initial={{ opacity: 0, pathLength: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              pathLength: [0, 1, 0],
              y: [0, -8, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          
          {/* Steam Line 3 */}
          <motion.path
            d="M60 35 Q60 25 65 20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className="text-coffee-amber"
            initial={{ opacity: 0, pathLength: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              pathLength: [0, 1, 0],
              y: [0, -8, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        </svg>
      </div>
      
      {/* Optional Loading Text */}
      {showText && (
        <motion.p
          className="text-coffee-amber mt-4 text-sm font-semibold"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading...
        </motion.p>
      )}
    </div>
  );
};

export default CoffeeLoader;
