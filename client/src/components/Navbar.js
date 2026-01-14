import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoSquare from '../assets/rabuste-logo-square.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/why-robusta', label: 'Why Robusta?' },
    { path: '/coffee', label: 'Coffee' },
    { path: '/art', label: 'Art' },
    { path: '/workshops', label: 'Workshops' },
    { path: '/franchise', label: 'Franchise' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? 'bg-coffee-darker/95 shadow-[0_8px_24px_rgba(0,0,0,0.55)]'
          : 'bg-gradient-to-b from-coffee-darker/95 via-coffee-darker/90 to-coffee-darker/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img
              src={logoSquare}
              alt="Rabuste Coffee logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg shadow-md shadow-black/40 ring-1 ring-coffee-amber/50"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-coffee-cream font-semibold tracking-[0.22em] text-[9px] uppercase">
                Rabuste Coffee
              </span>
              <span className="text-[10px] text-coffee-light/85">
                Bold Robusta • Art & Community
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-end flex-1">
            <div className="flex items-center gap-2">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative"
                  >
                    <motion.div
                      className="relative px-3 py-1 rounded-md transition-all duration-200"
                      whileHover={{ y: -1 }}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <span
                        className={`relative z-10 text-[13px] font-medium tracking-wide border-b-2 ${
                          isActive
                            ? 'text-coffee-amber border-coffee-amber'
                            : 'text-coffee-cream/80 border-transparent hover:text-coffee-gold hover:border-coffee-gold/80'
                        }`}
                      >
                        {link.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative p-2 text-coffee-cream focus:outline-none rounded-lg hover:bg-coffee-brown/60 transition-colors duration-200"
            whileTap={{ scale: 0.9 }}
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </motion.svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-1 mb-3 rounded-xl bg-coffee-darker/98 shadow-xl shadow-black/70 overflow-hidden border border-white/5">
                <div className="py-1 divide-y divide-white/5">
                  {navLinks.map((link, index) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-5 py-3 text-sm font-medium tracking-wide transition-all duration-200 ${
                            isActive
                              ? 'bg-coffee-amber/10 text-coffee-amber'
                              : 'text-coffee-cream/90 hover:bg-white/5 hover:text-coffee-gold'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;

