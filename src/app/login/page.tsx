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
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

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