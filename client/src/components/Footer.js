import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-coffee-darkest border-t border-coffee-brown/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-1"
          >
            <h3 className="text-lg font-heading font-bold text-coffee-amber mb-0.5">
              Rabuste Coffee
            </h3>
            <p className="text-coffee-light/80 text-xs leading-snug">
              Crafting exceptional coffee experiences with passion and precision. 
              Discover the bold flavors of Robusta coffee.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-1.5"
          >
            <h4 className="text-sm font-semibold text-coffee-amber mb-1">Quick Links</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <ul className="space-y-0.5">
                <li>
                  <Link
                    to="/"
                    className="text-coffee-light/80 hover:text-coffee-amber transition-colors duration-300 text-xs"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-coffee-light/80 hover:text-coffee-amber transition-colors duration-300 text-xs"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/coffee"
                    className="text-coffee-light/80 hover:text-coffee-amber transition-colors duration-300 text-xs"
                  >
                    Menu
                  </Link>
                </li>
              </ul>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    to="/art"
                    className="text-coffee-light/80 hover:text-coffee-amber transition-colors duration-300 text-xs"
                  >
                    Art Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/workshops"
                    className="text-coffee-light/80 hover:text-coffee-amber transition-colors duration-300 text-xs"
                  >
                    Workshops
                  </Link>
                </li>
                <li>
                  <Link
                    to="/franchise"
                    className="text-coffee-light/80 hover:text-coffee-amber transition-colors duration-300 text-xs"
                  >
                    Franchise
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Contact & Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-1"
          >
            <h4 className="text-sm font-semibold text-coffee-amber mb-1">Connect With Us</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-1.5 text-coffee-light/80">
                <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>rabustocoffee@gmail.com</span>
              </li>
              <li className="flex items-center gap-1.5 text-coffee-light/80">
                <svg className="w-4 h-4 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 XXX XXX XXXX</span>
              </li>
              <li className="flex items-start gap-1.5 text-coffee-light/80">
                <svg className="w-4 h-4 text-coffee-amber mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Visit our coffee shop locations</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-3 pt-2 border-t border-coffee-brown/20 flex flex-col md:flex-row justify-between items-center gap-2"
        >
          <p className="text-coffee-light/60 text-xs">
            © {currentYear} Rabuste Coffee. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/why-robusta"
              className="text-coffee-light/60 hover:text-coffee-amber transition-colors duration-300 text-xs"
            >
              Why Robusta
            </Link>
            <Link
              to="/pre-order"
              className="text-coffee-light/60 hover:text-coffee-amber transition-colors duration-300 text-xs"
            >
              Order Online
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

