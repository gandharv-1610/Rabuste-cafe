import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="relative pt-20 min-h-screen flex items-center justify-center bg-coffee-darker overflow-hidden px-4">
      {/* Animated gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-coffee-espresso via-coffee-brown to-coffee-dark [background-size:200%_200%] animate-gradient"
      />
      {/* Decorative blurred orbs */}
      <div aria-hidden className="absolute -z-10 top-24 left-[-80px] w-72 h-72 rounded-full bg-coffee-amber/10 blur-3xl" />
      <div aria-hidden className="absolute -z-10 bottom-10 right-[-60px] w-80 h-80 rounded-full bg-coffee-gold/10 blur-3xl" />

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6 animate-fadeIn">
          <img
            src={logoHorizontal}
            alt="Rabuste Coffee"
            className="h-10 md:h-12 opacity-95 drop-shadow-md animate-float"
          />
          <p className="mt-2 text-xs tracking-wide text-coffee-light/70">
            Admin Console
          </p>
        </div>

        <div className={`bg-coffee-brown/25 backdrop-blur-xl border border-coffee-brown/50 rounded-2xl p-6 shadow-2xl shadow-black/40 transition-transform duration-300 hover:scale-[1.01] ${error ? 'animate-shake' : ''}`}>
          <h1 className="text-3xl font-display font-bold text-coffee-amber mb-1 text-center">
            Admin Login
          </h1>
          <p className="text-coffee-light/80 text-center mb-6 text-sm">
            Sign in to manage Rabuste Coffee content.
          </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/40 px-4 py-2 text-sm text-red-300 animate-shake" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-coffee-amber mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouchedEmail(true)}
              required
              autoComplete="username"
              aria-invalid={emailInvalid}
              className={`w-full rounded-lg border bg-coffee-brown/40 px-3 py-2 text-coffee-cream placeholder-coffee-light/50 focus:outline-none focus:ring-2 transition-shadow duration-200 shadow-[0_0_0_0_rgba(0,0,0,0)] ${emailInvalid || error ? 'border-red-500/60 focus:ring-red-500 focus:border-red-500/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)]' : 'border-coffee-brown focus:ring-coffee-amber focus:border-coffee-amber/70 focus:shadow-[0_0_0_3px_rgba(255,111,0,0.15)]'}`}
              placeholder="admin@rabuste.coffee"
            />
            {emailInvalid && (
              <p className="mt-1 text-xs text-red-300">Enter a valid email.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-coffee-amber mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouchedPassword(true)}
                required
                autoComplete="current-password"
                aria-invalid={passwordInvalid}
                className={`w-full rounded-lg border bg-coffee-brown/40 px-3 py-2 pr-12 text-coffee-cream placeholder-coffee-light/50 focus:outline-none focus:ring-2 transition-shadow duration-200 shadow-[0_0_0_0_rgba(0,0,0,0)] ${passwordInvalid || error ? 'border-red-500/60 focus:ring-red-500 focus:border-red-500/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)]' : 'border-coffee-brown focus:ring-coffee-amber focus:border-coffee-amber/70 focus:shadow-[0_0_0_3px_rgba(255,111,0,0.15)]'}`}
                placeholder="Enter your password"
              />
              {passwordInvalid && (
                <p className="mt-1 text-xs text-red-300">Password must be at least 6 characters.</p>
              )}
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-md text-xs font-semibold text-coffee-amber/90 hover:text-coffee-amber bg-coffee-dark/30 hover:bg-coffee-dark/40 border border-coffee-brown/60 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-coffee-amber text-coffee-darker font-semibold py-2.5 hover:bg-coffee-gold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-coffee-darker border-t-transparent animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;


