'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingAPI } from '@/services/api';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import FancyLoader from '@/components/ui/FancyLoader';
import { ArrowLeft, MapPin, Home, Calendar, Clock, CheckSquare, Package, Info, DollarSign, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import useBookingStore from '@/store/bookingStore';
import Cookies from 'js-cookie';

export default function BookingSummaryPage() {
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasInitialized = useRef(false);
  
  // Booking data state
  const [address, setAddress] = useState<any>(null);
  const [service, setServiceData] = useState<any>(null);
  const [dateTime, setDateTime] = useState<any>(null);
  const [cleaningSupplies, setCleaningSupplies] = useState<{
    option: string;
    supplies: string[];
    discount: number;
  }>({
    option: 'bring-everything',
    supplies: [],
    discount: 0
  });
  const [messiness, setMessiness] = useState(3);
  const [totalPrice, setTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [pets, setPets] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('one-time');
  const [cleaningTime, setCleaningTime] = useState("2 hours 36 min");
  
  // Get booking store data and functions
  const bookingStore = useBookingStore();
  const currentBooking = useBookingStore(state => state.currentBooking);
  const syncFromCookies = useBookingStore(state => state.syncFromCookies);
  const createBooking = useBookingStore(state => state.createBooking);
  const setDetails = useBookingStore(state => state.setDetails);

  useEffect(() => {
    // Guard against multiple initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Load all the booking data from cookies and store
    const loadBookingData = async () => {
      try {
        // First sync cookies to the store to ensure it has the latest data
        syncFromCookies();
        
        console.log("Current booking state after sync:", currentBooking);
        
        // Load address
        const addressData = Cookies.get('bookingAddress');
        if (addressData) {
          const parsedAddress = JSON.parse(addressData);
          setAddress(parsedAddress);
          
          // Make sure the address data is in the store
          if (!currentBooking.addressId) {
            bookingStore.setAddress(parsedAddress);
          }
        } else if (currentBooking.addressId) {
          // If not in cookie but in store, reconstruct from store
          setAddress({
            addressId: currentBooking.addressId,
            name: currentBooking.addressName,
            streetAddress: currentBooking.streetAddress,
            city: currentBooking.city,
            state: currentBooking.state,
            zipCode: currentBooking.zipCode,
            squareFootage: currentBooking.squareFootage
          });
        } else {
          router.push('/booking/address');
          return;
        }
        
        // Load service
        const serviceData = Cookies.get('bookingService');
        

        if (serviceData) {
          const parsedService = JSON.parse(serviceData);
          setServiceData(parsedService);
          setBasePrice(parsedService.basePrice || 0);
          
          // Make sure the service data is in the store
          if (!currentBooking.serviceId) {
            bookingStore.setService(parsedService);
          }
        } else if (currentBooking.serviceId) {
          // If not in cookie but in store, reconstruct from store
          setServiceData({
            serviceId: currentBooking.serviceId,
            serviceName: currentBooking.serviceName,
            serviceDescription: currentBooking.serviceDescription,
            basePrice: currentBooking.basePrice
          });
          setBasePrice(currentBooking.basePrice || 0);
        } else {
          router.push('/booking/services');
          return;
        }
        
        // Load date/time
        const dateTimeData = Cookies.get('bookingDateTime');
        if (dateTimeData) {
          const parsedDateTime = JSON.parse(dateTimeData);
          setDateTime(parsedDateTime);
          
          // Make sure the datetime data is in the store
          if (!currentBooking.date) {
            bookingStore.setDateTime(parsedDateTime);
          }
        } else if (currentBooking.date) {
          // If not in cookie but in store, reconstruct from store
          setDateTime({
            date: currentBooking.date,
            timeSlot: currentBooking.timeSlot,
            preferredDates: currentBooking.preferredDates,
            preferredTimeSlots: currentBooking.preferredTimeSlots,
            flexibleScheduling: currentBooking.flexibleScheduling
          });
        } else {
          router.push('/booking/datetime');
          return;
        }

        // Get other details from the store or defaults
        // For messiness
        setMessiness(currentBooking.messiness || 3);
        
        // For pets
        if (currentBooking.hasPets) {
          setPets(['has-pets']);
        }
        
        // For frequency
        setFrequency(currentBooking.frequency || 'one-time');
        
        // Get supplies info
        let suppliesOption = 'bring-everything';
        let selectedSupplies: string[] = [];
        let suppliesDiscount = 0;
        
        if (currentBooking.supplies === 'customer') {
          suppliesOption = 'i-have-all';
          suppliesDiscount = 50;
        } 
        // Check notes for any supplies-related info
        else if (currentBooking.notes && currentBooking.notes.includes('supplies:')) {
          const suppliesInfo = currentBooking.notes.split('supplies:')[1].split(';')[0].trim();
          if (suppliesInfo.includes('customer-provides-all')) {
            suppliesOption = 'i-have-all';
            suppliesDiscount = 50;
          } else if (suppliesInfo.includes('customer-provides-vacuum')) {
            suppliesOption = 'i-have-vacuum';
            suppliesDiscount = 20;
          }
        }
        
        setCleaningSupplies({
          option: suppliesOption,
          supplies: selectedSupplies,
          discount: suppliesDiscount
        });
        
        // Get cleaning time
        const storedCleaningTime = Cookies.get('cleaningTime');
        if (storedCleaningTime) {
          setCleaningTime(storedCleaningTime);
        }
        
        // Calculate total price
        const servicePrice = currentBooking.basePrice || (serviceData ? JSON.parse(serviceData).basePrice : 0) || 0;
        setBasePrice(servicePrice);

        // Don't subtract the supplies discount again as it's already included in the price calculation
        // from the services page
        setTotalPrice(servicePrice);

        console.log("Price displayed:", basePrice);
        
        // Log the final state for debugging
        console.log("Final booking data loaded:", {
          service: currentBooking.serviceId,
          address: currentBooking.addressId,
          datetime: currentBooking.date
        });
      } catch (error) {
        console.error('Error loading booking data:', error);
        setError('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadBookingData();
    }
  }, [isAuthenticated, isLoading, router]); // Removed problematic dependencies

  const handleBookNow = async () => {
    setProcessingBooking(true);
    setError(null);
    
    try {
      // Prepare any additional booking details
      let notesWithSupplies = currentBooking.notes || '';
      
      if (cleaningSupplies.option !== 'bring-everything') {
        if (!notesWithSupplies.includes('supplies:')) {
          notesWithSupplies += `${notesWithSupplies ? '; ' : ''}supplies: ${cleaningSupplies.option === 'i-have-all' ? 'customer-provides-all' : 'customer-provides-vacuum'}`;
        }
      }
      
      // Set the supplies based on the option
      const suppliesValue = cleaningSupplies.option === 'i-have-all' ? 'customer' : 'cleaner';
      
      // Update the details in the store
      setDetails({
        notes: notesWithSupplies,
        supplies: suppliesValue as 'customer' | 'cleaner',
        messiness: messiness,
        hasPets: pets.includes('has-pets'),
        frequency: frequency as 'one-time' | 'weekly' | 'bi-weekly' | 'monthly'
      });
      
      // Give a small delay to ensure the store is updated
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Log the data before creating booking
      console.log("Booking data before submission:", currentBooking);
      
      const result = await createBooking();
      console.log("createBooking result:", result);
      console.log("result type:", typeof result);
      if (result && typeof result === 'object') {
        console.log("result keys:", Object.keys(result));
      }
      
      // Handle the booking result
      const bookingResult = result ? (result as unknown as { _id?: string } | string) : null;
      
      if (bookingResult) {
        console.log('Booking created successfully', bookingResult);
        
        // Clear the booking data from cookies
        Cookies.remove('bookingService');
        Cookies.remove('bookingAddress');
        Cookies.remove('bookingDateTime');
        Cookies.remove('cleaningTime');
        
        // Get the booking ID from the result
        const bookingId = typeof bookingResult === 'string' 
          ? bookingResult 
          : (bookingResult._id || '');
        
        // Navigate to receipt page with booking ID
        router.push(`/booking/receipt?id=${bookingId}`);
      } else {
        console.error('Failed to create booking');
        setError('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setProcessingBooking(false);
    }
  };

  if (isLoading || loading) {
    return <FancyLoader visible={true} message="Loading booking details..." />;
  }

  if (processingBooking) {
    return <FancyLoader visible={true} message="Creating your booking..." />;
  }

  // Format preferred dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white">
        {/* Header */}
        <div className="py-4 flex items-center border-b border-gray-200 px-4">
          <Link href="/booking/datetime" className="mr-2">
            <ArrowLeft size={20} className="text-gray-800" />
          </Link>
          <h1 className="text-xl font-semibold">Review & Confirm</h1>
        </div>
        
        <div className="px-4 py-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Review your booking</h2>
          <p className="text-gray-500 mb-6">
            Please confirm the details of your cleaning service
          </p>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Location Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center mb-3">
              <MapPin className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Location</h2>
            </div>
            
            {address && (
              <Link href="/booking/address" className="block">
                <div className="cursor-pointer">
                  <h3 className="font-medium text-gray-800">{address.name}</h3>
                  <p className="text-gray-600">{address.streetAddress}, {address.city}, {address.state} {address.zipCode}</p>
                  <p className="text-gray-600">{address.squareFootage} sq ft</p>
                  {address.notes && (
                    <p className="text-gray-500 italic mt-1">Note: {address.notes}</p>
                  )}
                </div>
              </Link>
            )}
          </div>
          
          {/* Property Details Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center mb-3">
              <Home className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Property Details</h2>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Square Footage:</span>
              <span className="font-medium text-gray-800">{address ? address.squareFootage : 0} sq ft</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Messiness Level:</span>
              <div className="flex items-center">
                <span className="font-medium text-gray-800 mr-2">{messiness}/10</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium text-white
                  ${messiness <= 3 ? 'bg-green-500' : messiness <= 6 ? 'bg-orange-500' : 'bg-red-500'}`}
                >
                  {messiness}
                </div>
              </div>
            </div>
          </div>
          
          {/* Date & Time Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center mb-3">
              <Calendar className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Date & Time</h2>
            </div>
            
            <Link href="/booking/datetime" className="block">
              <div className="cursor-pointer">
                {dateTime && (
                  <>
                    <div className="mb-3">
                      <p className="text-gray-600 mb-1">Preferred Dates:</p>
                      <div className="flex items-center">
                        <Calendar className="text-blue-500 mr-2" size={16} />
                        <span className="text-gray-800">{dateTime.preferredDates && dateTime.preferredDates.length > 0 ? formatDate(dateTime.preferredDates[0]) : 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-gray-600 mb-1">Preferred Times:</p>
                      <div className="flex items-center">
                        <Clock className="text-blue-500 mr-2" size={16} />
                        <span className="text-gray-800">
                      {dateTime && dateTime.preferredTimeSlots && dateTime.preferredTimeSlots.length > 0 
                        ? (typeof dateTime.preferredTimeSlots[0] === 'string' 
                            ? dateTime.preferredTimeSlots[0] 
                            : dateTime.timeSlot) 
                        : 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Display additional time slots if there are any */}
                    {dateTime && dateTime.preferredTimeSlots && dateTime.preferredTimeSlots.length > 1 && (
                      <div className="mt-1 mb-3">
                        <p className="text-xs text-gray-500">Additional preferred times:</p>
                        <div className="text-xs text-gray-500">
                            {dateTime.preferredTimeSlots.slice(1).map((slot: string | { display?: string }, index: number) => (
                            <div key={index} className="flex items-center mt-1">
                              <Clock className="text-blue-300 mr-1" size={12} />
                              <span>{typeof slot === 'string' ? slot : (slot?.display || '')}</span>
                            </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="text-gray-800">
                        {frequency === 'one-time' ? 'One-time' : 
                          frequency === 'weekly' ? 'Weekly' : 
                          frequency === 'bi-weekly' ? 'Biweekly' : 
                          'Monthly'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Link>
          </div>
          
          {/* Max Clean Time Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center mb-3">
              <Clock className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Max Clean Time</h2>
            </div>
            
            <div className="flex items-start mb-3">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <Clock size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-blue-500 text-xl font-bold">{cleaningTime}</p>
                <p className="text-gray-500 text-sm">
                  Maximum cleaning time based on your property size and selected services
                </p>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm italic">
              Note: All cleanings must finish by 6:00 PM. Your selected time slot has been adjusted accordingly.
            </p>
          </div>
          
          {/* Services Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center mb-3">
              <CheckSquare className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Services</h2>
            </div>
            
            <Link href="/booking/services" className="block">
              <div className="cursor-pointer">
                {service && (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800">{service.serviceName}</h3>
                        <p className="text-gray-600">{service.serviceDescription}</p>
                        <p className="text-gray-600">{address ? address.squareFootage : 0} sq ft</p>
                      </div>
                      <span className="text-blue-500 font-semibold">${basePrice}</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-gray-500 italic">No additional services selected</p>
                    </div>
                  </>
                )}
              </div>
            </Link>
          </div>
          
          {/* Supplies & Equipment Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center mb-3">
              <Package className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Supplies & Equipment</h2>
            </div>
            
            <Link href="/booking/services" className="block">
              <div className="cursor-pointer">
                <p className="font-medium text-gray-800 mb-1">
                  {cleaningSupplies.option === 'bring-everything' 
                    ? 'Cleaners bring all supplies' 
                    : cleaningSupplies.option === 'i-have-vacuum' 
                      ? 'Customer provides vacuum' 
                      : 'Customer provides all supplies'}
                </p>
                
                {cleaningSupplies.discount > 0 && (
                  <p className="text-green-500 font-medium mb-3">Discount: -${cleaningSupplies.discount}</p>
                )}
                
                {cleaningSupplies.option === 'i-have-all' && cleaningSupplies.supplies.length > 0 && (
                  <>
                    <p className="font-medium text-gray-700 mb-2">Selected Supplies:</p>
                    <div className="grid grid-cols-2 gap-y-2">
                      {cleaningSupplies.supplies.map((supply, index) => (
                        <div key={index} className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{supply}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Link>
          </div>
          
          {/* Messiness Level Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center mb-3">
              <Info className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Messiness Level</h2>
            </div>
            
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-white mr-3
                ${messiness <= 3 ? 'bg-green-500' : messiness <= 6 ? 'bg-orange-500' : 'bg-red-500'}`}
              >
                {messiness}
              </div>
              <p className="text-gray-700">
                {messiness <= 3 
                  ? 'Your space is relatively tidy. Standard cleaning should be sufficient.'
                  : messiness <= 6
                    ? 'Your space has moderate clutter. Some extra attention may be needed.'
                    : 'Your space is quite messy. Deep cleaning is recommended.'}
              </p>
            </div>
          </div>
          
          {/* Pricing Section */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center mb-3">
              <DollarSign className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Pricing</h2>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">{service ? service.serviceName : 'Standard Clean'}</span>
                <span className="text-gray-800">${basePrice}</span>
              </div>
              
              {cleaningSupplies.discount > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Supplies & Equipment Discount</span>
                  <span className="text-green-500">-${cleaningSupplies.discount}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-semibold text-blue-500 text-xl">${totalPrice}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 mb-8 pb-8">
            <Link href="/booking/datetime" className="flex-1">
              <button className="w-full py-4 border border-gray-300 rounded-lg text-center font-medium flex items-center justify-center text-blue-500 hover:bg-gray-50 transition-colors hover:scale-105 cursor-pointer">
                <ArrowLeft size={18} className="mr-2" /> Back
              </button>
            </Link>
            
            <button
              className="flex-1 py-4 bg-blue-500 text-white rounded-lg text-center font-medium transition-colors hover:bg-blue-600 hover:scale-105 cursor-pointer" 
              onClick={handleBookNow}
              disabled={processingBooking}
            >
              Book Now
            </button>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors">
          <Link href="/" className="text-blue-500 font-medium flex items-center">
            <Home size={18} className="mr-2" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}