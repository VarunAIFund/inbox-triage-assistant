import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getStatus();
      setIsAuthenticated(response.data.authenticated);
      setError(null);
    } catch (err) {
      setError('Failed to check authentication status');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    try {
      const response = await authAPI.getAuthUrl();
      const authUrl = response.data.authUrl;
      
      const popup = window.open(authUrl, 'gmail-auth', 'width=500,height=600');
      
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            const code = prompt('Please enter the authorization code from the popup:');
            if (code) {
              handleAuthCode(code).then(resolve).catch(reject);
            } else {
              reject(new Error('Authentication cancelled'));
            }
          }
        }, 1000);
      });
    } catch (err) {
      setError('Failed to start authentication');
      throw err;
    }
  };

  const handleAuthCode = async (code) => {
    try {
      await authAPI.handleCallback(code);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError('Authentication failed');
      throw err;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      setError('Failed to logout');
      throw err;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    checkAuthStatus,
    logout,
  };
};