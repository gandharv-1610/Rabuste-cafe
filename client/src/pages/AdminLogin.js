import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="pt-20 min-h-screen flex items-center justify-center bg-coffee-darker px-4">
      <div className="w-full max-width-md max-w-md bg-coffee-brown/20 border border-coffee-brown/60 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-display font-bold text-coffee-amber mb-2 text-center">
          Admin Login
        </h1>
        <p className="text-coffee-light/80 text-center mb-6 text-sm">
          Sign in to manage Rabuste Coffee content.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/40 px-4 py-2 text-sm text-red-300">
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
              required
              autoComplete="username"
              className="w-full rounded-lg border border-coffee-brown bg-coffee-brown/40 px-3 py-2 text-coffee-cream placeholder-coffee-light/50 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
              placeholder="admin@rabuste.coffee"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-coffee-amber mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-coffee-brown bg-coffee-brown/40 px-3 py-2 text-coffee-cream placeholder-coffee-light/50 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-coffee-amber text-coffee-darker font-semibold py-2.5 hover:bg-coffee-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;


