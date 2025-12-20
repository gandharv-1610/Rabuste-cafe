import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('rabuste_admin_token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Validate token by making an API call with timeout
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        // Try to fetch admin stats which requires authentication
        const response = await Promise.race([
          api.get('/admin/stats'),
          timeoutPromise
        ]);

        if (response && response.status === 200) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        // Token is invalid, expired, or request failed
        console.error('Token validation failed:', error.message || error);
        localStorage.removeItem('rabuste_admin_token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-coffee-darker">
        <div className="text-center">
          <div className="text-coffee-amber text-xl mb-2">Loading...</div>
          <div className="text-coffee-light/60 text-sm">Validating authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;


