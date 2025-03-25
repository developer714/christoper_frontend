// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FancyLoader from '@/components/ui/FancyLoader';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'cleaner'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
        role
      });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <FancyLoader visible={isLoading} />
      
      <Card className="w-full max-w-md p-6 shadow-lg border border-gray-200 rounded-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-500">Sign up to get started</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input 
              type="text"
              label="First Name"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              leftIcon={<User size={20} className="text-gray-500" />}
              required
            />
            
            <Input 
              type="text"
              label="Last Name"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              leftIcon={<User size={20} className="text-gray-500" />}
              required
            />
          </div>
          
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
            type="tel"
            label="Phone (optional)"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone size={20} className="text-gray-500" />}
            className="mb-4"
          />
          
          <Input 
            type="password"
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={20} className="text-gray-500" />}
            required
            className="mb-4"
          />
          
          <Input 
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock size={20} className="text-gray-500" />}
            required
            className="mb-6"
          />
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`flex items-center justify-center p-4 border rounded-lg ${
                  role === 'customer' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setRole('customer')}
              >
                <User className="mr-2 text-blue-500" size={20} />
                <span>Customer</span>
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center p-4 border rounded-lg ${
                  role === 'cleaner' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setRole('cleaner')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
                  <path d="M11.5 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/>
                  <path d="M11.5 22h1c3.314 0 6-2.686 6-6V9.7l-2.77-4.3H7.23c-.252 0-.489.128-.627.298L4.5 9.87c-.12.14-.268.188-.44.228l-1.956.49a.6.6 0 0 0-.318.966l5.1 6.16a.6.6 0 0 0 .93.012l.517-.543a.6.6 0 0 1 .846-.3l.305.133a.6.6 0 0 1 .357.55V20.4a.6.6 0 0 0 .6.6Z"/>
                </svg>
                <span>Cleaner</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Button 
            title="Create Account" 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={isSubmitting}
            className="mb-4 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-[36px] font-medium transition-transform hover:scale-105"
          />

          <div className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:underline font-medium">
              Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}