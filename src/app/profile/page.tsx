// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { User, MapPin, CreditCard, Settings, LogOut, Calendar, Clock, ArrowRight } from 'lucide-react';
import FancyLoader from '@/components/ui/FancyLoader';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  // Commenting out booking related state
  // const [recentBookings, setRecentBookings] = useState<any[]>([]);
  // const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Commenting out the bookings fetch
    /*
    const fetchRecentBookings = async () => {
      try {
        const bookingsData = await bookingAPI.getUserBookings();
        // Sort by date (newest first) and take the 3 most recent
        const sortedBookings = bookingsData
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setRecentBookings(sortedBookings);
      } catch (error) {
        console.error('Error fetching recent bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRecentBookings();
    }
    */
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <FancyLoader visible={true} message="Loading profile..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Format date helper function - keeping but not using
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get status color - keeping but not using
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="md:flex md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-blue-500">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-500">{user?.email}</p>
                  {user?.phone && <p className="text-gray-500">{user?.phone}</p>}
                </div>
              </div>
              
              <Button
                title="Edit Profile"
                icon={<Settings size={16} />}
                iconPosition="left"
                className="w-full bg-gray-400 text-[#ccc] font-bold hover:bg-blue-100 border border-blue-200 rounded-lg py-2 font-medium transition-colors cursor-pointer"
                onClick={() => router.push('/profile/edit')}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div 
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push('/profile/addresses')}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                  <MapPin size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">My Addresses</h3>
                  <p className="text-sm text-gray-500">Manage your cleaning locations</p>
                </div>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push('/profile/payment')}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                  <CreditCard size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Payment Methods</h3>
                  <p className="text-sm text-gray-500">Manage your payment options</p>
                </div>
              </div>

              
            </div>
          </div>

          {/* Removed Recent Bookings Section */}
          <div className="lg:col-span-2">
            {/* Additional Section: Membership/Subscription */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Become a Member</h2>
              <p className="mb-4 opacity-90">Get discounts on regular cleanings and priority scheduling.</p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                    <Check size={12} className="text-white" />
                  </div>
                  <span>Save up to 15% on weekly cleanings</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                    <Check size={12} className="text-white" />
                  </div>
                  <span>Guaranteed booking slots</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                    <Check size={12} className="text-white" />
                  </div>
                  <span>Consistent cleaning team</span>
                </li>
              </ul>
              <button
                onClick={() => router.push('/membership')}
                className="bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 w-full flex items-center justify-center text-red-500 hover:text-red-600 py-3 px-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} className="mr-2" />
          Log Out
      </button>
    </div>
  );
}

// Missing Check icon import
function Check(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}