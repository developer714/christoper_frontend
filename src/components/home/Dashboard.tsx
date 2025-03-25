// src/components/home/Dashboard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { bookingAPI, serviceAPI } from '@/services/api';
import { 
  Home, 
  Plus, 
  Sparkles, 
  Briefcase, 
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import Cookies from 'js-cookie';
import ServiceCardCarousel from '@/components/ui/ServiceCardCarousel';
export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        // Fetch real bookings from API
        const bookingsData = await bookingAPI.getUserBookings();
        setBookings(bookingsData);
        
        // Fetch real services from API
        const servicesData = await serviceAPI.getServices();
        setServices(servicesData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, router]);

  // Auto-scrolling functionality
  useEffect(() => {
    if (!autoScrollEnabled || !carouselRef.current || services.length <= 2) return;

    const scrollRight = () => {
      if (!carouselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const newScrollLeft = scrollLeft + 300;
      
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        // If we're at the end, scroll back to the beginning
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Otherwise, continue scrolling right
        carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    };

    // Set up the auto-scroll timer
    autoScrollTimerRef.current = setInterval(scrollRight, 3000);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [autoScrollEnabled, services.length]);

  // Handle manual scrolling - pause auto-scroll when user interacts
  const handleManualScroll = () => {
    setAutoScrollEnabled(false);
    
    // Resume auto-scroll after 8 seconds of inactivity
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }
    
    autoScrollTimerRef.current = setTimeout(() => {
      setAutoScrollEnabled(true);
    }, 8000);
  };

  // Scroll control functions
  const scrollLeft = () => {
    if (!carouselRef.current) return;
    const newScrollLeft = carouselRef.current.scrollLeft - 300;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    handleManualScroll();
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    const newScrollLeft = carouselRef.current.scrollLeft + 300;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    handleManualScroll();
  };

  // Handle loading state
  if (isLoading || loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Filter upcoming bookings
  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );

  // Get service color based on service name or icon property
  const getServiceColor = (service: any) => {
    if (service.icon === 'sparkles' || service.name.includes('Deep')) 
      return 'bg-[#1b85b8]';
    if (service.icon === 'briefcase' || service.name.includes('Move')) 
      return 'bg-[#ae5a41]';
    if (service.icon === 'party' || service.name.includes('Party')) 
      return 'bg-[#559e83]';
    if (service.icon === 'office' || service.name.includes('Office'))
      return 'bg-[#5a5255]';
    return 'bg-[#c3cb71]';
  };

  // Get icon based on service name or icon property
  const getServiceIcon = (service: any) => {
    if (service.icon === 'sparkles' || service.name.includes('Deep')) 
      return <Sparkles size={32} className="text-white" />;
    if (service.icon === 'briefcase' || service.name.includes('Move')) 
      return <Briefcase size={32} className="text-white" />;
    if (service.icon === 'party' || service.name.includes('Party')) 
      return <PartyPopper size={32} className="text-white" />;
    return <Home size={32} className="text-white" />;
  };

  const handleServiceSelect = (service: any) => {
    setSelectedServiceId(service._id);
    
    // Store the selected service in cookies
    Cookies.set('bookingService', JSON.stringify({
      serviceId: service._id,
      serviceName: service.name,
      serviceDescription: service.description || '',
      basePrice: service.basePrice || 120,
      estimatedPrice: service.basePrice || 120
    }));
  };

  const handleContinueToAddress = () => {
    if (selectedServiceId) {
      // Navigate to address selection
      router.push('/booking/address');
    } else if (services.length > 0) {
      // If no service selected, select the first one and continue
      handleServiceSelect(services[0]);
      router.push('/booking/address');
    } else {
      // If no services available, go to service selection page
      router.push('/booking/services');
    }
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-xl font-bold text-gray-800">
          Hello, {user?.firstName || 'test'}!
        </h2>
        <p className="text-gray-500 mt-1">Ready to book a cleaning service?</p>
      </div>

      {/* Book a Cleaning Button - Always enabled */}
      <div className="px-4 pb-6">
        <button 
          className="w-full bg-[#3498db] text-white rounded-md py-3 px-4 flex items-center justify-center font-medium hover:bg-blue-600 transition-colors cursor-pointer"
          onClick={handleContinueToAddress}
        >
          <Plus size={20} className="mr-2" />
          Book a Cleaning Service
        </button>
      </div>

      {/* Explore Section - Using the new ServiceCardCarousel component */}
      <div className="px-4 pb-6">
        <ServiceCardCarousel title="Explore" />
      </div>

      {/* Cleaning Services Carousel Section */}
      {/* <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cleaning Services</h3>
          <div className="flex space-x-2">
            <button 
              onClick={scrollLeft} 
              className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={scrollRight} 
              className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        {services.length > 0 ? (
          <div className="relative">
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-1 px-1 space-x-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={handleManualScroll}
            >
              {services.map((service) => (
                <div 
                  key={service._id}
                  className={`snap-center flex-shrink-0 w-64 h-36 rounded-xl shadow-md overflow-hidden cursor-pointer transition-transform transform hover:scale-105 ${
                    selectedServiceId === service._id ? 'ring-3 ring-blue-400' : ''
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className={`h-full w-full p-4 flex flex-col justify-between ${getServiceColor(service)} text-white`}>
                    <div className="bg-white/20 rounded-full p-2 w-fit">
                      {getServiceIcon(service)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{service.name}</h3>
                      <p className="text-sm opacity-90 line-clamp-2">{service.description || 'Professional cleaning service'}</p>
                      <div className="mt-1 font-bold">${service.basePrice || 120}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            Loading services...
          </div>
        )}
      </div>
 */}
      {/* Upcoming Bookings Section */}
      <div className="px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
          <Link href="/bookings" className="text-sm font-medium text-[#3498db]">
            View All
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div 
                key={booking._id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/bookings/${booking._id}`)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{booking.serviceType?.name || 'Cleaning Service'}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        ${booking.price} • {booking.squareFootage} sq ft
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-blue-500 text-white' : 
                      booking.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar size={18} className="text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock size={18} className="text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{booking.timeSlot}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin size={18} className="text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 truncate">
                        {booking.address?.streetAddress || 'Address not available'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation to booking details
                        setBookingToCancel(booking._id);
                        setShowCancelModal(true);
                      }}
                      className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors px-3 py-1 border border-red-200 rounded-full hover:bg-red-50 cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No upcoming bookings.
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cancel Booking</h3>
            
            <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-600">
                <span className="font-semibold">Important:</span> Cancelling within 2 hours of your scheduled booking will result in a full charge.
              </p>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                No, Keep Booking
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation to booking details
                  setCancelling(true);
                  bookingAPI.cancelBooking(bookingToCancel!)
                    .then(() => {
                      // Update local state after cancellation
                      setBookings(prevBookings => 
                        prevBookings.map(b => 
                          b._id === bookingToCancel ? {...b, status: 'cancelled'} : b
                        )
                      );
                      setShowCancelModal(false);
                      setCancelling(false);
                    })
                    .catch(err => {
                      console.error('Error cancelling booking:', err);
                      setCancelling(false);
                    });
                }}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center cursor-pointer"
              >
                {isCancelling ? (
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
    </div>
  );
}