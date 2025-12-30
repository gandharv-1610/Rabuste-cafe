import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-coffee-amber text-coffee-darker px-6 py-3 rounded-lg shadow-2xl border-2 border-coffee-gold/50 flex items-center gap-3 min-w-[280px]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-2xl"
            >
              ✓
            </motion.div>
            <span className="font-semibold text-sm flex-1">{message}</span>
            <button
              onClick={onClose}
              className="text-coffee-darker/70 hover:text-coffee-darker transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

