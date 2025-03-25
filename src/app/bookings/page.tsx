// src/app/bookings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import { Calendar, Clock, MapPin, Plus, AlertCircle } from 'lucide-react';
import FancyLoader from '@/components/ui/FancyLoader';
import Cookies from 'js-cookie';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const bookingsData = await bookingAPI.getUserBookings();
        setBookings(bookingsData);
        filterBookings(bookingsData, activeFilter);
      } catch (err: any) {
        setError('Failed to load bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, isLoading, router, activeFilter]);

  const filterBookings = (bookings: any[], filter: 'upcoming' | 'past') => {
    const now = new Date();
    
    if (filter === 'upcoming') {
      const upcoming = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return (bookingDate >= now && booking.status !== 'cancelled') || 
               (booking.status !== 'completed' && booking.status !== 'cancelled');
      });
      setFilteredBookings(upcoming);
    } else {
      const past = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate < now || booking.status === 'completed' || booking.status === 'cancelled';
      });
      setFilteredBookings(past);
    }
  };

  const handleFilterChange = (filter: 'upcoming' | 'past') => {
    setActiveFilter(filter);
    filterBookings(bookings, filter);
  };

  // Format date helper function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get status color
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

  const handleCancelBooking = (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation(); // Prevent navigation to booking details
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setCancelling(true);
    try {
      await bookingAPI.cancelBooking(bookingToCancel);
      
      // Update the local state to reflect the cancellation
      const updatedBookings = bookings.map(booking => 
        booking._id === bookingToCancel 
          ? { ...booking, status: 'cancelled' } 
          : booking
      );
      
      setBookings(updatedBookings);
      
      // Re-filter the bookings
      filterBookings(updatedBookings, activeFilter);
      
      // Close the modal
      setShowCancelModal(false);
      setBookingToCancel(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleBooking = (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation(); // Prevent navigation to booking details
    const booking = bookings.find(b => b._id === bookingId);
  
    if (!booking) {
      return;
    }
    
    // Check if booking is within 24 hours
    if (isWithin24Hours(booking.date)) {
      // Set an error state or show a toast message if you have a toast library
      setError('Bookings cannot be rescheduled within 24 hours of the scheduled time');
      return;
    }

      setBookingToReschedule(bookingId);
      setShowRescheduleModal(true);
    };
  
  const confirmReschedule = () => {
    if (!bookingToReschedule) return;
    
    // Store booking ID in localStorage to use it on the datetime page
    Cookies.set('rescheduleBookingId', bookingToReschedule, { 
      expires: 1,
      path: '/',
      sameSite: 'lax'  // This is important for cross-page navigation
    });
    setTimeout(() => {
      // Use window.location instead of router.push for a full page load
      window.location.href = '/booking/datetime?mode=reschedule';
    }, 100);
  };

  const isWithin24Hours = (dateString: string, timeSlot?: string): boolean => {
    // Parse the booking date
    const bookingDate = new Date(dateString);
    const now = new Date();
    
    // If timeSlot is provided (e.g., "8:00 AM - 10:00 AM"), extract the start time
    if (timeSlot) {
      const startTimeMatch = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (startTimeMatch) {
        let hours = parseInt(startTimeMatch[1], 10);
        const minutes = parseInt(startTimeMatch[2], 10);
        const ampm = startTimeMatch[3].toUpperCase();
        
        // Convert 12-hour format to 24-hour
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        // Set the time part of the booking date
        bookingDate.setHours(hours, minutes, 0, 0);
      }
    }
    
    // Calculate time difference in hours
    const diffMs = bookingDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    console.log(`Booking: ${bookingDate.toLocaleString()}, Now: ${now.toLocaleString()}, Diff hours: ${diffHours}`);
    
    return diffHours <= 24;
  };

  if (isLoading || loading) {
    return <FancyLoader visible={true} message="Loading bookings..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="md:flex md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
            <p className="text-gray-600">View and manage your cleaning services</p>
          </div>
          
          
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle size={20} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-gray-100 p-1 rounded-full">
            <button
              className={`px-5 py-2.5 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                activeFilter === 'upcoming' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleFilterChange('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-5 py-2.5 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                activeFilter === 'past' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleFilterChange('past')}
            >
              Past
            </button>
          </div>
          
          <Button
            title="Book New"
            icon={<Plus size={18} />}
            iconPosition="left"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full md:rounded-lg transition-colors cursor-pointer hover:scale-105 text-sm md:text-base"
            onClick={() => router.push('/booking/new')}
          />

        </div>

        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map(booking => (
              <div 
                key={booking._id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow h-full"
                onClick={() => router.push(`/bookings/${booking._id}`)}
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="cursor-pointer">
                      <h3 className="font-semibold text-lg text-gray-800">{booking.serviceType?.name || 'Cleaning Service'}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        ${booking.price} • {booking.squareFootage} sq ft
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 space-y-3 flex-grow cursor-pointer">
                    <div className="flex items-start">
                      <Calendar size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{formatDate(booking.date)}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{booking.timeSlot}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 truncate">
                        {booking.address?.streetAddress || 'Address not available'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Only show action buttons for upcoming bookings that aren't already cancelled */}
                  {activeFilter === 'upcoming' && booking.status !== 'cancelled' && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                      {!isWithin24Hours(booking.date, booking.timeSlot) ? (
                        <button
                          onClick={(e) => handleRescheduleBooking(e, booking._id)}
                          className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors px-3 py-1 border border-blue-200 rounded-full hover:bg-blue-50 cursor-pointer"
                        >
                          Reschedule
                        </button>
                      ) : (
                        <div className="text-gray-400 text-sm font-medium px-3 py-1 border border-gray-200 rounded-full cursor-not-allowed">
                          Cannot Reschedule
                        </div>
                      )}
                      <button
                        onClick={(e) => handleCancelBooking(e, booking._id)}
                        className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors px-3 py-1 border border-red-200 rounded-full hover:bg-red-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-gray-800 mb-2">
              {activeFilter === 'upcoming' 
                ? "No upcoming bookings"
                : "No past bookings"
              }
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {activeFilter === 'upcoming' 
                ? "You don't have any upcoming cleaning services scheduled."
                : "You don't have any past cleaning services."
              }
            </p>
            {activeFilter === 'upcoming' && (
              <Button
                title="Book a Cleaning"
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium"
                onClick={() => router.push('/booking/new')}
              />
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Cancel Booking</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                No, Keep Booking
              </button>
              <button
                onClick={confirmCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center cursor-pointer"
              >
                {cancelling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reschedule Confirmation Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Reschedule Booking</h3>
            <p className="text-gray-600 mb-6">
              You'll be taken to select a new date and time for your booking. Continue?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                disabled={rescheduling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={rescheduling}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center cursor-pointer"
              >
                Continue to Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}