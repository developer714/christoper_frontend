'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingAPI } from '@/services/api';
import FancyLoader from '@/components/ui/FancyLoader';
import { 
  CheckCircle, 
  ArrowLeft, 
  MapPin, 
  Home, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Package, 
  User, 
  DollarSign, 
  Download, 
  Share2, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import useBookingStore from '@/store/bookingStore';

// Enum for booking status (matching the model)
enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Types for Booking and related entities
interface Address {
  _id?: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  squareFootage: number;
  notes?: string;
}

interface ServiceType {
  _id?: string;
  name: string;
  description: string;
  price: number;
}

interface Payment {
  method: string;
  lastFour: string;
}

interface Cleaner {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Booking {
  _id: string;
  user?: string;
  address?: Address;
  serviceType?: ServiceType;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  price: number;
  squareFootage: number;
  notes?: string;
  cleaner?: Cleaner;
  additionalServices?: string[];
  frequency?: string;
  supplies?: string;
  hasPets?: boolean;
  messiness?: number;
  payment?: Payment;
}

function BookingReceiptContent() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [cookieDataUsed, setCookieDataUsed] = useState<boolean>(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  const [fetchAttempted, setFetchAttempted] = useState<boolean>(false);
  
  // Get the booking store data
  const bookingStore = useBookingStore();
  const currentBooking = useBookingStore(state => state.currentBooking);

  useEffect(() => {
    console.log("BookingReceiptPage - bookingId from URL:", bookingId);
    
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (fetchAttempted) return;

    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setFetchAttempted(true);
        
        if (!bookingId) {
          // If no booking ID is provided in the URL, we'll display an error
          setError('No booking ID provided. Unable to retrieve booking details.');
          setLoading(false);
          return;
        }

        try {
          // First try to get the booking from the API
          const response = await bookingAPI.getBookingById(bookingId);
          if (response && response.data) {
            setBooking(response.data);
            setCookieDataUsed(false);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('Error fetching booking from API:', apiError);
        }

        // If we get here, API failed, so we'll try to use cookie/store data
        // Sync from cookies to ensure store has latest data
        bookingStore.syncFromCookies();
        
        // Check if we have the necessary data in the store
        if (currentBooking && 
            currentBooking.serviceId && 
            currentBooking.addressId && 
            currentBooking.date) {
          
          // Construct a booking object from the store data
          const storeBooking: Booking = {
            _id: bookingId,
            status: BookingStatus.CONFIRMED,
            date: currentBooking.date || new Date().toISOString(),
            timeSlot: currentBooking.timeSlot || '',
            price: currentBooking.estimatedPrice || currentBooking.basePrice || 0,
            squareFootage: currentBooking.squareFootage || 0,
            notes: currentBooking.notes || '',
            address: {
              name: currentBooking.addressName || '',
              streetAddress: currentBooking.streetAddress || '',
              city: currentBooking.city || '',
              state: currentBooking.state || '',
              zipCode: currentBooking.zipCode || '',
              squareFootage: currentBooking.squareFootage || 0
            },
            serviceType: {
              name: currentBooking.serviceName || '',
              description: currentBooking.serviceDescription || '',
              price: currentBooking.basePrice || 0
            },
            frequency: currentBooking.frequency || 'one-time',
            supplies: currentBooking.supplies || 'cleaner',
            hasPets: currentBooking.hasPets,
            messiness: currentBooking.messiness || 3
          };
          
          setBooking(storeBooking);
          setCookieDataUsed(true);
        } else {
          // Try to get data directly from cookies as a last resort
          const serviceData = Cookies.get('bookingService');
          const addressData = Cookies.get('bookingAddress');
          const dateTimeData = Cookies.get('bookingDateTime');
          
          if (serviceData && addressData && dateTimeData) {
            const parsedService = JSON.parse(serviceData);
            const parsedAddress = JSON.parse(addressData);
            const parsedDateTime = JSON.parse(dateTimeData);
            
            const cookieBooking: Booking = {
              _id: bookingId,
              status: BookingStatus.CONFIRMED,
              date: parsedDateTime.date || new Date().toISOString(),
              timeSlot: parsedDateTime.timeSlot || '',
              price: parsedService.basePrice || 0,
              squareFootage: parsedAddress.squareFootage || 0,
              notes: '',
              address: {
                name: parsedAddress.name || '',
                streetAddress: parsedAddress.streetAddress || '',
                city: parsedAddress.city || '',
                state: parsedAddress.state || '',
                zipCode: parsedAddress.zipCode || '',
                squareFootage: parsedAddress.squareFootage || 0
              },
              serviceType: {
                name: parsedService.serviceName || '',
                description: parsedService.serviceDescription || '',
                price: parsedService.basePrice || 0
              },
              frequency: 'one-time',
              supplies: 'cleaner',
              hasPets: false,
              messiness: 5
            };
            
            setBooking(cookieBooking);
            setCookieDataUsed(true);
          } else {
            // If we still don't have data, show an error
            setError('Unable to retrieve booking details. Please contact support.');
          }
        }
      } catch (err) {
        console.error('Error handling booking data:', err);
        setError('Failed to load booking details. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && bookingId) {
      fetchBookingDetails();
    }
  }, [isAuthenticated, isLoading, bookingId, router]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Unavailable';
    }
  };

  const getStatusColor = (status: BookingStatus): string => {
    switch(status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-500';
      case BookingStatus.PENDING:
        return 'bg-yellow-500';
      case BookingStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case BookingStatus.COMPLETED:
        return 'bg-purple-500';
      case BookingStatus.CANCELLED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: BookingStatus): string => {
    switch(status) {
      case BookingStatus.CONFIRMED:
        return 'Confirmed';
      case BookingStatus.PENDING:
        return 'Pending';
      case BookingStatus.IN_PROGRESS:
        return 'In Progress';
      case BookingStatus.COMPLETED:
        return 'Completed';
      case BookingStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const handleDownloadReceipt = () => {
    alert('Receipt download feature will be implemented soon!');
  };

  const handleShareReceipt = () => {
    alert('Receipt sharing feature will be implemented soon!');
  };

  if (isLoading || loading) {
    return <FancyLoader visible={true} message="Loading your receipt..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error || "Unable to retrieve booking details"}</p>
          <Link href="/bookings">
            <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
              Go to My Bookings
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white shadow-md">
        {/* Header with success animation */}
        <div className="py-8 px-4 bg-blue-500 text-white text-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-3"
          >
            <CheckCircle size={60} className="mx-auto" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold mb-1"
          >
            Booking Confirmed!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-blue-100"
          >
            Your booking has been successfully placed
          </motion.p>
          
          {/* Confetti-like background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white opacity-10 rounded-full"
                style={{
                  width: Math.random() * 30 + 10 + 'px',
                  height: Math.random() * 30 + 10 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animationDuration: Math.random() * 20 + 10 + 's',
                  animationDelay: Math.random() * 2 + 's'
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="px-4 py-6">
          {/* Receipt Information */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Receipt</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handleDownloadReceipt}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Download receipt"
                >
                  <Download size={18} className="text-gray-700" />
                </button>
                <button 
                  onClick={handleShareReceipt}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Share receipt"
                >
                  <Share2 size={18} className="text-gray-700" />
                </button>
              </div>
            </div>

            {cookieDataUsed && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-yellow-700 text-sm flex items-start">
                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <p>This receipt is showing your booking details as entered. Your confirmed booking details will be available shortly.</p>
              </div>
            )}
            
            {/* Location Section */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <MapPin className="text-blue-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Location</h2>
              </div>
              
              {booking.address ? (
                <div>
                  <h3 className="font-medium text-gray-800">{booking.address.name}</h3>
                  <p className="text-gray-600">
                    {booking.address.streetAddress}, 
                    {booking.address.city}, 
                    {booking.address.state} 
                    {booking.address.zipCode}
                  </p>
                  <p className="text-gray-600">{booking.squareFootage || booking.address.squareFootage} sq ft</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Address information not available</p>
              )}
            </div>
            
            {/* Date & Time Section */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <Calendar className="text-blue-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Date & Time</h2>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center mb-2">
                  <Calendar className="text-blue-500 mr-2" size={16} />
                  <span className="text-gray-800">
                    {booking.date ? formatDate(booking.date) : 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="text-blue-500 mr-2" size={16} />
                  <span className="text-gray-800">
                    {booking.timeSlot || 'Not specified'}
                  </span>
                </div>
              </div>
              
              {/* Frequency Display */}
              <div className="flex justify-between items-center mb-1 text-sm mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-600">Frequency:</span>
                <span className="text-gray-800">
                  {booking.frequency === 'one-time' ? 'One-time' : 
                   booking.frequency === 'weekly' ? 'Weekly' : 
                   booking.frequency === 'bi-weekly' ? 'Biweekly' : 
                   'Monthly'}
                </span>
              </div>
            </div>
            
            {/* Services & Pricing Section */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <CheckSquare className="text-blue-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Services</h2>
              </div>
              
              {booking.serviceType ? (
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-medium text-gray-800">{booking.serviceType.name}</h3>
                    <p className="text-gray-600 text-sm">{booking.serviceType.description}</p>
                  </div>
                  <span className="text-gray-800 font-semibold">${booking.price}</span>
                </div>
              ) : (
                <p className="text-gray-500 italic mb-3">Service information not available</p>
              )}
              
              {/* Additional Services if any */}
              {booking.additionalServices && booking.additionalServices.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Additional Services:</p>
                  <ul className="text-sm text-gray-600">
                    {booking.additionalServices.map((service, index) => (
                      <li key={index} className="flex items-center mb-1">
                        <CheckCircle size={14} className="text-green-500 mr-2" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Supplies Display */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="text-gray-600">Supplies:</span>
                  <span className="text-gray-800">
                    {booking.supplies === 'customer' ? 'Customer provides' : 'Cleaner provides'}
                  </span>
                </div>
                
                {/* If there was a discount for supplies */}
                {booking.supplies === 'customer' && (
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-gray-600">Supplies Discount:</span>
                    <span className="text-green-500">-$50.00</span>
                  </div>
                )}
              </div>
              
              {/* Border line before total */}
              <div className="border-t border-gray-200 my-3"></div>
              
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-blue-500 text-xl">
                  ${booking.price}
                </span>
              </div>
            </div>
            
            {/* Payment Information - Only show if we have payment data */}
            {booking.payment && (
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <DollarSign className="text-blue-500 mr-2" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">Payment</h2>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Credit Card</p>
                      <p className="text-gray-500 text-sm">Ending in {booking.payment.lastFour || '****'}</p>
                    </div>
                  </div>
                  <span className="text-gray-800 font-bold">${booking.price}</span>
                </div>
                
                <div className="bg-green-50 p-2 rounded-md border border-green-100 flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  <span className="text-green-600 text-sm">Payment Successful</span>
                </div>
              </div>
            )}
            
            {/* Notes Section if there are any */}
            {booking.notes && (
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><line x1="9" y1="9" x2="10" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>
                  <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
                </div>
                
                <p className="text-gray-600 text-sm">{booking.notes}</p>
              </div>
            )}
            
            {/* Cleaner Information (if assigned) */}
            {booking.cleaner ? (
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <User className="text-blue-500 mr-2" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">Your Cleaner</h2>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3 mr-3">
                    <User size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{booking.cleaner.name}</p>
                    {booking.cleaner.phone && (
                      <p className="text-sm text-gray-600">{booking.cleaner.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <User className="text-blue-500 mr-2" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">Your Cleaner</h2>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3 mr-3">
                    <User size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Professional Cleaner</p>
                    <p className="text-sm text-gray-500">You'll receive cleaner details before your appointment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mb-8">
            <Link href="/bookings">
              <button className="w-full py-4 bg-blue-500 text-white rounded-lg text-center font-medium hover:bg-blue-600 hover:scale-105 transition-colors cursor-pointer">
                View My Bookings
              </button>
            </Link>
            
            <Link href="/">
              <button className="w-full py-4 border border-gray-300 text-blue-500 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors cursor-pointer hover:scale-105">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
        
        {/* Support Message */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm mb-1">Questions about your booking?</p>
          <Link href="/support">
            <span className="text-blue-500 font-medium text-sm flex items-center justify-center">
              Contact Support <ChevronRight size={16} className="ml-1" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingReceiptPage() {
  return (
    <Suspense fallback={<FancyLoader visible={true} message="Loading your receipt..." />}>
      <BookingReceiptContent />
    </Suspense>
  );
}