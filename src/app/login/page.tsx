// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FancyLoader from '@/components/ui/FancyLoader';

// Add interface for login response
interface LoginResponse {
  token: string;
  // add other response fields if needed
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting login...');
      await login(email, password);
      
      // First store both token and auth state
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      console.log('Token found:', token);
      
      if (token) {
        localStorage.setItem('isAuthenticated', 'true');
        console.log('Auth state stored, redirecting...');
        
        // Try using setTimeout to ensure state is saved before redirect
        setTimeout(() => {
          window.location.replace('https://christoperfrontend-production.up.railway.app/');
        }, 100);
      } else {
        console.log('No token found after login');
        setError('Authentication failed - no token received');
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login');
      localStorage.removeItem('isAuthenticated');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check both cookie and localStorage on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const hasCookie = document.cookie.includes('token=');
    
    if (isAuthenticated && hasCookie) {
      window.location.replace('https://christoperfrontend-production.up.railway.app/');
    }
  }, []);

  useEffect(() => {
    // Check if there's an auth message to display
    const authMessage = sessionStorage.getItem('authMessage');
    if (authMessage) {
      setError(authMessage);
      // Clear the message so it doesn't show again on refresh
      sessionStorage.removeItem('authMessage');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <FancyLoader visible={isLoading} />
      
      <Card className="w-full max-w-md p-6 shadow-lg border border-gray-200 rounded-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Input 
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={20} className="text-gray-500" />}
            required
            className="mb-4"
          />
          
          <Input 
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={20} className="text-gray-500" />}
            required
            className="mb-6"
          />
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Button 
            title="Login" 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={isSubmitting}
            className="mb-4 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-[36px] font-medium transition-transform hover:scale-105"
          />

          <div className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-500 hover:underline font-medium cursor-pointer">
              Create Account
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}