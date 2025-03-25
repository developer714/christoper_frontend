// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: 'customer' | 'cleaner' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle token expiration
  const handleTokenExpiration = () => {
    // Clear any session data
    Cookies.remove('token');
    setUser(null);
    
    // Store a message to display on the login page
    sessionStorage.setItem('authMessage', 'Your session has expired. Please log in again.');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Wrap API calls to handle expired tokens
  const makeAuthenticatedRequest = async (apiCall: Function) => {
    try {
      return await apiCall();
    } catch (err: any) {
      // Check if error is due to expired token
      if (err.response?.data?.expired) {
        handleTokenExpiration();
      }
      throw err;
    }
  };

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await makeAuthenticatedRequest(() => authAPI.getUserProfile());
        console.log('Auth check successful, user data:', userData);
        if (userData && userData.user) {
          setUser(userData.user);
          // If we're on an auth page (login/register) and already authenticated, redirect to home
          const path = window.location.pathname;
          if (['/login', '/register'].includes(path)) {
            router.push('/');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Optionally, you can clear any stale token here if needed
      } finally {
        setIsLoading(false);
      }
    };
  
    // Always check auth on load
    checkAuth();
  }, [router]);
  

  // Enhanced API methods with token expiration handling
  const enhancedAPI = {
    login: async (email: string, password: string) => {
      return await authAPI.login(email, password);
    },
    register: async (userData: any) => {
      return await authAPI.register(userData);
    },
    getUserProfile: async () => {
      return await makeAuthenticatedRequest(() => authAPI.getUserProfile());
    },
    logout: async () => {
      return await authAPI.logout();
    }
    // Add other API methods as needed
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting login...');
      const response = await enhancedAPI.login(email, password);
      console.log('Login successful, response:', response);

      setUser({
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phone: response.phone,
        role: response.role,
      });

      console.log('User state updated, redirecting...');

      setTimeout(() => {
        console.log('Executing redirect to homepage');
        router.push('/');
        setTimeout(() => {
          console.log('Checking if redirect happened');
          if (window.location.pathname.includes('login')) {
            console.log('Still on login page, using direct navigation');
            //window.location.href = '/';
          }
        }, 2500);
      }, 300);
      return response;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await enhancedAPI.register(userData);
      setUser({
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phone: response.phone,
        role: response.role,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint to clear cookies on the server
      await enhancedAPI.logout();
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      // Clear any legacy tokens
      Cookies.remove('token');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;