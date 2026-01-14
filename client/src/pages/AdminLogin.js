import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import logoHorizontal from '../assets/rabuste-logo-horizontal.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const emailInvalid = touchedEmail && !isValidEmail(email);
  const passwordInvalid = touchedPassword && password.length < 6;

  // Redirect authenticated admins away from login
  React.useEffect(() => {
    const token = localStorage.getItem('rabuste_admin_token');
    if (token) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/auth/login', { email, password });
      const { token } = response.data || {};

      if (!token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('rabuste_admin_token', token);
      navigate('/admin', { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Login failed. Please check your email and password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-darkest via-coffee-darker to-coffee-dark overflow-hidden px-4 py-12">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient mesh */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-coffee-espresso/30 via-coffee-brown/20 to-coffee-dark/30 [background-size:200%_200%] animate-gradient"
        />
        
        {/* Animated coffee bean pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF8C00' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Decorative animated orbs */}
        <motion.div 
          aria-hidden 
          className="absolute top-20 left-[-100px] w-96 h-96 rounded-full bg-coffee-amber/8 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          aria-hidden 
          className="absolute bottom-20 right-[-80px] w-[400px] h-[400px] rounded-full bg-coffee-gold/8 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          aria-hidden 
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-coffee-amber/5 blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Brand Section */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img
              src={logoHorizontal}
              alt="Rabuste Coffee"
              className="h-12 md:h-14 opacity-95 drop-shadow-2xl filter brightness-110"
            />
          </motion.div>
          <motion.p 
            className="mt-3 text-sm tracking-[0.2em] text-coffee-amber/80 font-semibold uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Admin Console
          </motion.p>
          <div className="mt-2 w-16 h-0.5 bg-gradient-to-r from-transparent via-coffee-amber/60 to-transparent"></div>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          className="relative bg-gradient-to-br from-coffee-brown/30 via-coffee-brown/20 to-coffee-dark/30 backdrop-blur-2xl border border-coffee-amber/20 rounded-3xl p-8 shadow-2xl shadow-black/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-coffee-amber/20 via-coffee-gold/20 to-coffee-amber/20 rounded-3xl blur-xl opacity-50 -z-10"></div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-heading font-bold bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Admin Login
            </motion.h1>
            <motion.p 
              className="text-coffee-light/70 text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Secure access to Rabuste Coffee management
            </motion.p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-6 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 px-4 py-3 text-sm text-red-300 backdrop-blur-sm shadow-lg"
                role="alert"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-coffee-amber mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => {
                    setTouchedEmail(true);
                    setFocusedField(null);
                  }}
                  required
                  autoComplete="username"
                  aria-invalid={emailInvalid}
                  className={`w-full rounded-xl border-2 bg-coffee-brown/40 backdrop-blur-sm px-4 py-3.5 pl-12 text-coffee-cream placeholder-coffee-light/40 focus:outline-none transition-all duration-300 ${
                    emailInvalid || error 
                      ? 'border-red-500/60 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                      : focusedField === 'email'
                      ? 'border-coffee-amber focus:ring-4 focus:ring-coffee-amber/20 shadow-lg shadow-coffee-amber/10'
                      : 'border-coffee-brown/50 focus:border-coffee-amber/70 focus:ring-4 focus:ring-coffee-amber/10'
                  }`}
                  placeholder="admin@rabuste.coffee"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-coffee-amber' : 'text-coffee-light/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <AnimatePresence>
                {emailInvalid && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-2 text-xs text-red-300 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Enter a valid email address
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-sm font-semibold text-coffee-amber mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => {
                    setTouchedPassword(true);
                    setFocusedField(null);
                  }}
                  required
                  autoComplete="current-password"
                  aria-invalid={passwordInvalid}
                  className={`w-full rounded-xl border-2 bg-coffee-brown/40 backdrop-blur-sm px-4 py-3.5 pl-12 pr-14 text-coffee-cream placeholder-coffee-light/40 focus:outline-none transition-all duration-300 ${
                    passwordInvalid || error 
                      ? 'border-red-500/60 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                      : focusedField === 'password'
                      ? 'border-coffee-amber focus:ring-4 focus:ring-coffee-amber/20 shadow-lg shadow-coffee-amber/10'
                      : 'border-coffee-brown/50 focus:border-coffee-amber/70 focus:ring-4 focus:ring-coffee-amber/10'
                  }`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-coffee-amber' : 'text-coffee-light/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-coffee-amber/70 hover:text-coffee-amber transition-colors group z-10 w-12"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      key="hide-icon"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      key="show-icon"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <AnimatePresence>
                {passwordInvalid && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-2 text-xs text-red-300 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Password must be at least 6 characters
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <button
                type="submit"
                disabled={loading || emailInvalid || passwordInvalid}
                className="w-full mt-4 rounded-xl bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber text-coffee-darker font-bold py-3.5 px-6 hover:from-coffee-gold hover:via-coffee-amber hover:to-coffee-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-coffee-amber/30 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </motion.div>
          </form>

          {/* Security Indicator */}
          <motion.div 
            className="mt-6 pt-6 border-t border-coffee-brown/30 flex items-center justify-center gap-2 text-xs text-coffee-light/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure encrypted connection</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;


