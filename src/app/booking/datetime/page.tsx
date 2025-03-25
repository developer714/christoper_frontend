'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import { ArrowLeft, Clock, Calendar, Check, Info, ChevronRight, ChevronDown, ChevronUp, X, Tag } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import FancyLoader from '@/components/ui/FancyLoader';
import { toast } from 'react-hot-toast';
import useBookingStore from '@/store/bookingStore';

interface TimeSlot {
  id: string;
  time: string;
  endTime: string;
  display: string;
}

interface DateInfo {
  date: Date;
  formatted: string;
  day: string;
  dayNum: string;
  month: string;
  dayOfWeek: number;
}

interface DateTimeSelection {
  date: string;
  displayDate: string;
  timeSlots: string[];
  expanded: boolean;
}

function DateTimeSelectionContent() {
  const [availableDates, setAvailableDates] = useState<DateInfo[]>([]);
  const [availableStartTimes, setAvailableStartTimes] = useState<TimeSlot[]>([]);
  const [selectedDateTimes, setSelectedDateTimes] = useState<DateTimeSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaningTime, setCleaningTime] = useState("2 hours 36 min");
  const [cleaningDuration, setCleaningDuration] = useState(156); // in minutes
  const [selectedView, setSelectedView] = useState<'current' | 'next'>('current');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const [key, setKey] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingStore = useBookingStore();
  const isNavigating = useRef(false); // Use ref to prevent repeated navigation attempts
  const timeSelectionRef = useRef<HTMLDivElement>(null);

  // Parse cleaning duration from string like "2 hours 36 min"
  const parseCleaningDuration = (durationStr: string) => {
    const hoursMatch = durationStr.match(/(\d+)\s*hours?/);
    const minutesMatch = durationStr.match(/(\d+)\s*min/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    
    return hours * 60 + minutes; // return total minutes
  };

  useEffect(() => {
  
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  
    // Check if we're in reschedule mode
    const mode = searchParams.get('mode');
    const isReschedule = mode === 'reschedule';
    setIsRescheduleMode(isReschedule);
    
    if (isReschedule) {
      // Retrieve the booking ID from localStorage
      const storedBookingId = Cookies.get('rescheduleBookingId');
      if (storedBookingId) {
        setRescheduleBookingId(storedBookingId);
      } else {
        // If no booking ID is found, redirect to bookings page
        console.warn('No booking ID found in cookie for rescheduling');
        toast.error('No booking selected for rescheduling');
        router.push('/bookings');
        return;
      }
    } else {
      // For normal booking flow, check if we have service and address data
      const bookingService = Cookies.get('bookingService');
      const bookingAddress = Cookies.get('bookingAddress');
      if (!bookingService || !bookingAddress) {
        router.push('/booking/new');
        return;
      }
    }
  
    // Try to get the cleaning time from cookies
    const savedCleaningTime = Cookies.get('cleaningTime');
    if (savedCleaningTime) {
      setCleaningTime(savedCleaningTime);
      const duration = parseCleaningDuration(savedCleaningTime);
      setCleaningDuration(duration);
    }
  
    // Generate dates and time slots
    generateDates();
    generateTimeSlots();
    
    setLoading(false);
  }, [isAuthenticated, isLoading, router, searchParams]);

  useEffect(() => {
    // Generate time slots whenever cleaning duration changes
    generateTimeSlots();
  }, [cleaningDuration]);

  useEffect(() => {
    console.log("Available time slots updated:", availableStartTimes);
  }, [availableStartTimes]);

  // Format a date for display (e.g., "Monday, Mar 17")
  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Generate dates for the next 14 days starting from tomorrow
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Start from tomorrow for 14 days
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      dates.push({
        date: date,
        formatted: date.toISOString().split('T')[0],
        day: daysOfWeek[date.getDay()],
        dayNum: date.getDate().toString(),
        month: months[date.getMonth()],
        dayOfWeek: date.getDay() // Add this to know which day of week (0-6, where 0 is Sunday)
      });
    }
    
    setAvailableDates(dates);
  };

  // Generate time slots based on the cleaning duration and business rules
  const generateTimeSlots = () => {
    console.log("Generating time slots with duration:", cleaningDuration);
    const slots = [];
    // Start times at 8:00 AM and increment by 2 hours
    const startHours = [8, 10, 12, 14, 16, 18];
    
    // Business end time (8:00 PM = 20:00)
    const businessEndHour = 20; 
    
    // Calculate cleaning duration in hours (rounded up to the nearest hour)
    const durationHours = Math.ceil(cleaningDuration / 60);
    
    for (let startHour of startHours) {
      // Check if this cleaning would end before or at business hours
      const endHour = startHour + durationHours;
      
      if (endHour <= businessEndHour) {
        // Format start time
        const startHourFormatted = startHour > 12 ? startHour - 12 : startHour;
        const startAmPm = startHour >= 12 ? 'PM' : 'AM';
        
        // Format end time
        const endHourFormatted = endHour > 12 ? endHour - 12 : endHour;
        const endAmPm = endHour >= 12 ? 'PM' : 'AM';
        
        // Create the time slot
        const startTimeStr = `${startHourFormatted}:00 ${startAmPm}`;
        const endTimeStr = `${endHourFormatted}:00 ${endAmPm}`;
        const displayStr = `${startTimeStr} - ${endTimeStr}`;
        
        slots.push({
          id: startHour.toString(),
          time: startTimeStr,
          endTime: endTimeStr,
          display: displayStr
        });
      }
    }
    
    console.log("Generated slots:", slots);
    setAvailableStartTimes(slots);
  };

  // Toggle between current week and next week view
  const toggleDateView = () => {
    setSelectedView(selectedView === 'current' ? 'next' : 'current');
  };

  // Handle calendar date selection
  // Handle calendar date selection
const handleDateSelection = (dateInfo: DateInfo) => {
  setSelectedCalendarDate(dateInfo.formatted);
  
  // Check if this date is already in the selections
  const existingIndex = selectedDateTimes.findIndex(
    selection => selection.date === dateInfo.formatted
  );
  
  // If the date is already selected, remove it
  if (existingIndex !== -1) {
    const updatedSelections = [...selectedDateTimes];
    updatedSelections.splice(existingIndex, 1);
    setSelectedDateTimes(updatedSelections);
    
    // If we're removing the currently selected calendar date, clear it
    if (selectedCalendarDate === dateInfo.formatted) {
      setSelectedCalendarDate(null);
    }
    return;
  }


  
  // Otherwise, add the date to selections
  // Collapse all existing dates first
  const updatedSelections = selectedDateTimes.map(selection => ({
    ...selection,
    expanded: false
  }));
  
  // Add the new date with expanded time slots
  const newSelection: DateTimeSelection = {
    date: dateInfo.formatted,
    displayDate: formatDateForDisplay(dateInfo.formatted),
    timeSlots: [],
    expanded: true
  };
  
  setSelectedDateTimes([...updatedSelections, newSelection]);
  
  // Scroll to time selection
  setTimeout(() => {
    if (timeSelectionRef.current) {
      timeSelectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};
useEffect(() => {
  // Force a rerender when availableStartTimes changes
  setKey(prev => prev + 1);
}, [availableStartTimes]);

  // Toggle expansion of a date's time slots
  const toggleDateExpansion = (index: number) => {
    const updatedSelections = [...selectedDateTimes];
    updatedSelections.forEach(selection => {
      selection.expanded = false;
    });
    
    // Then, toggle the clicked date (if it was collapsed, it will expand)
    updatedSelections[index].expanded = !updatedSelections[index].expanded;
    
    setSelectedDateTimes(updatedSelections);
  };

  // Remove a date from selections
  const removeDate = (index: number) => {
    const updatedSelections = [...selectedDateTimes];
    updatedSelections.splice(index, 1);
    setSelectedDateTimes(updatedSelections);
    
    // If the removed date was the selected calendar date, clear it
    if (selectedDateTimes[index].date === selectedCalendarDate) {
      setSelectedCalendarDate(null);
    }
  };

  // Handle time slot selection for a specific date
  const toggleTimeSlot = (dateIndex: number, timeSlotDisplay: string) => {
    const updatedSelections = [...selectedDateTimes];
    const currentTimeSlots = updatedSelections[dateIndex].timeSlots;
    
    if (currentTimeSlots.includes(timeSlotDisplay)) {
      // Remove the time slot if already selected
      updatedSelections[dateIndex].timeSlots = currentTimeSlots.filter(
        slot => slot !== timeSlotDisplay
      );
    } else {
      // Add the time slot if not already selected
      updatedSelections[dateIndex].timeSlots = [...currentTimeSlots, timeSlotDisplay];
    }
    
    setSelectedDateTimes(updatedSelections);
  };

  // Toggle between select all and deselect all
  const toggleAllTimeSlots = (dateIndex: number) => {
    const updatedSelections = [...selectedDateTimes];
    const currentSelection = updatedSelections[dateIndex];
    
    // Get all available time slot displays
    const allTimeSlotDisplays = availableStartTimes.map(slot => slot.display);
    
    // Check if all time slots are already selected
    const allSelected = allTimeSlotDisplays.every(slot => 
      currentSelection.timeSlots.includes(slot)
    );
    
    if (allSelected) {
      // If all are selected, deselect all
      updatedSelections[dateIndex].timeSlots = [];
    } else {
      // Otherwise, select all
      updatedSelections[dateIndex].timeSlots = allTimeSlotDisplays;
    }
    
    setSelectedDateTimes(updatedSelections);
  };

  // Handle the continue button click
  const handleContinue = async () => {
    // Prevent multiple navigation attempts
    if (isNavigating.current) return;
    isNavigating.current = true;
    
    console.log("handleContinue called");
    
    // Validate selections - check that at least one date has at least one time slot
    const hasValidSelection = selectedDateTimes.some(
      dateTime => dateTime.timeSlots.length > 0
    );
    
    if (!hasValidSelection) {
      console.log("Validation failed - no date has time slots selected");
      isNavigating.current = false;
      return;
    }

    // Find first date with time slots as the primary selection
    const primarySelection = selectedDateTimes.find(dt => dt.timeSlots.length > 0);
    
    if (!primarySelection) {
      toast.error("Please select a date and time");
      isNavigating.current = false;
      return;
    }
    
    // Format the selected date as ISO string
    const formattedDate = primarySelection.date;
    const selectedTimeSlot = primarySelection.timeSlots[0]; // First time slot of primary date
    
    try {
      setSubmitting(true);
      
      if (isRescheduleMode && rescheduleBookingId) {
        // Handle rescheduling
        console.log("Rescheduling booking", rescheduleBookingId, "to", formattedDate, selectedTimeSlot);
        
        const success = await bookingStore.rescheduleBooking(
          rescheduleBookingId,
          formattedDate,
          selectedTimeSlot
        );
        
        if (success) {
          Cookies.remove('rescheduleBookingId', { path: '/' });
          toast.success('Booking rescheduled successfully');
          router.push('/bookings');
        } else {
          toast.error('Failed to reschedule booking');
          isNavigating.current = false;
        }
      } else {
        // Handle normal booking flow
        console.log("Validation passed, saving to cookies");
        
        // Gather all preferred dates and time slots
        const allPreferredDates = selectedDateTimes.map(dt => dt.date);
        const allPreferredTimeSlots: string[] = [];
        
        selectedDateTimes.forEach(dateTime => {
          dateTime.timeSlots.forEach(timeSlot => {
            // Include date info with the time slot to avoid ambiguity
            allPreferredTimeSlots.push(`${dateTime.displayDate}: ${timeSlot}`);
          });
        });
        
        // Create the data object
        const dateTimeData = {
          date: formattedDate,
          timeSlot: selectedTimeSlot,
          preferredDates: allPreferredDates,
          preferredTimeSlots: allPreferredTimeSlots,
          flexibleScheduling: selectedDateTimes.length > 1 || primarySelection.timeSlots.length > 1,
          // Add discount flag if eligible
          discountEligible: selectedDateTimes.length >= 3
        };

        // Store date/time in cookies
        Cookies.set('bookingDateTime', JSON.stringify(dateTimeData), { expires: 7 });

        console.log("About to navigate to summary page");
        router.push('/booking/summary');
      }
    } catch (error) {
      console.error("Error processing date/time selection:", error);
      toast.error('An error occurred. Please try again.');
      isNavigating.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  // Check if the continue button should be enabled
  const isContinueEnabled = () => {
    // Enable button if at least one date has at least one time slot selected
    return selectedDateTimes.some(dateTime => dateTime.timeSlots.length > 0);
  };
  
  // Get total number of selected time slots across all dates
  const getTotalTimeSlots = () => {
    return selectedDateTimes.reduce(
      (total, dateTime) => total + dateTime.timeSlots.length, 
      0
    );
  };

  // Check for discount eligibility - 3 or more dates
  const isDiscountEligible = selectedDateTimes.length >= 3;

  if (isLoading || loading) {
    return <FancyLoader visible={true} message="Loading scheduling options..." />;
  }

  // Get the current view dates (first 7 or second 7)
  const currentViewDates = selectedView === 'current' 
    ? availableDates.slice(0, 7) 
    : availableDates.slice(7);

  return (
    <div  key={key} className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-4">
      <div className="py-4 flex items-center border-b border-gray-200">
        <Link href={isRescheduleMode ? "/bookings" : "/booking/services"} className="mr-2">
          <ArrowLeft size={20} className="text-gray-800" />
        </Link>
        <h1 className="text-lg font-semibold">
          {isRescheduleMode ? "Reschedule Booking" : "Select Date & Time"}
        </h1>
      </div>

        <div className="py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">When do you need cleaning?</h2>
          <p className="text-gray-500 mb-6">
            Select your preferred dates and times for your cleaning service
          </p>

          {/* Cleaning Duration Section */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
            <div className="flex items-start mb-1">
              <Clock size={20} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">Cleaning Duration</h3>
                <p className="text-blue-500 text-xl font-bold">{cleaningTime}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Based on your property size and selected services, we've calculated the time needed for your cleaning.
            </p>
            <p className="text-gray-500 text-sm italic mt-2 flex items-center">
              <Info size={14} className="mr-1 flex-shrink-0" />
              All cleanings must finish by 8:00 PM, which limits available start times.
            </p>
          </div>

          {/* Discount Notification */}
          <div 
            className={`rounded-lg p-4 mb-6 border-l-4 ${
              isDiscountEligible 
                ? 'bg-green-50 border-green-500' 
                : 'bg-white border-gray-200'
            } flex items-start`}
          >
            <Tag 
              size={20} 
              className={`mr-2 mt-1 flex-shrink-0 ${
                isDiscountEligible ? 'text-green-500' : 'text-gray-500'
              }`} 
            />
            <div>
              <h3 className="font-semibold text-gray-800">Multi-Date Discount</h3>
              <p className="text-gray-600 text-sm">
                Select 3 or more dates to receive a 5% discount on your booking!
              </p>
              <div className="mt-2 flex items-center">
                <div className="bg-gray-200 h-2 rounded-full flex-grow mr-2">
                  <div 
                    className={`h-2 rounded-full ${isDiscountEligible ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min(100, (selectedDateTimes.length / 3) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {selectedDateTimes.length}/3 dates
                </span>
                {isDiscountEligible && (
                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    5% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Date Selection Calendar */}
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Calendar size={18} className="text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-800">Select Date</h3>
              </div>
              <div className="flex items-center">
                <button
                  onClick={toggleDateView}
                  className="text-blue-500 text-sm font-medium flex items-center cursor-pointer hover:underline"
                >
                  {selectedView === 'current' ? 'Next Week' : 'This Week'}
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({ length: 7 }, (_, i) => {
                // Calculate the day label based on the first day in the current view
                const startDayIndex = currentViewDates[0]?.dayOfWeek || 0;
                const dayIndex = (startDayIndex + i) % 7; // Wrap around after Saturday
                return (
                  <div key={i} className="text-center text-xs text-gray-500 font-medium">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]}
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {currentViewDates.map((dateObj) => {
                const isSelected = selectedDateTimes.some(dt => dt.date === dateObj.formatted);
                const isActive = dateObj.formatted === selectedCalendarDate;
                
                return (
                  <div
                    key={dateObj.formatted}
                    className={`border rounded-lg p-2 text-center cursor-pointer transition-all hover:shadow-sm ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                        : isSelected
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleDateSelection(dateObj)}
                  >
                    <div className={`text-xs font-medium ${
                      isActive ? 'text-white' : isSelected ? 'text-blue-500' : 'text-gray-500'
                    }`}>
                      {dateObj.day}
                    </div>
                    <div className={`text-lg font-bold ${
                      isActive ? 'text-white' : isSelected ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {dateObj.dayNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Dates and Time Slots Section */}
          {selectedDateTimes.length > 0 && (
            <div className="mb-6" ref={timeSelectionRef}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Clock size={18} className="text-blue-500 mr-2" />
                  Selected Times
                </h3>
                {getTotalTimeSlots() > 0 && (
                  <span className="text-sm font-medium text-blue-500">
                    {getTotalTimeSlots()} time{getTotalTimeSlots() !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              {selectedDateTimes.map((dateTimeSelection, index) => (
                <div 
                  key={dateTimeSelection.date}
                  className="mb-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Date Header - Always visible */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-blue-500 mr-2" />
                      <span className="font-medium">{dateTimeSelection.displayDate}</span>
                    </div>
                    <div className="flex items-center">
                      {dateTimeSelection.timeSlots.length > 0 && (
                        <span className="text-xs text-blue-500 font-medium mr-2">
                          {dateTimeSelection.timeSlots.length} selected
                        </span>
                      )}
                      <button
                        onClick={() => toggleDateExpansion(index)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        aria-label={dateTimeSelection.expanded ? "Collapse time slots" : "Expand time slots"}
                      >
                        {dateTimeSelection.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => removeDate(index)}
                        className="text-gray-500 hover:text-red-500 p-1 ml-1"
                        aria-label="Remove date"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Time Slots - Expandable */}
                  {dateTimeSelection.expanded && (
                    <div className="p-3">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-gray-500">Select available times:</p>
                        <button 
                          onClick={() => toggleAllTimeSlots(index)}
                          className="text-sm text-blue-500 font-medium hover:underline"
                        >
                          {availableStartTimes.every(slot => 
                            dateTimeSelection.timeSlots.includes(slot.display)
                          ) 
                            ? "Deselect All" 
                            : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {availableStartTimes.map((slot) => (
                          <div
                            key={`${dateTimeSelection.date}-${slot.id}`}
                            className={`border rounded p-2 cursor-pointer transition-all ${
                              dateTimeSelection.timeSlots.includes(slot.display)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => toggleTimeSlot(index, slot.display)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{slot.display}</span>
                              {dateTimeSelection.timeSlots.includes(slot.display) && (
                                <Check size={14} className="text-blue-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <p className="text-gray-500 text-sm italic mt-2 flex items-center">
                <Info size={14} className="mr-2 flex-shrink-0" />
                Select multiple dates and times that work for you. We'll confirm your booking based on cleaner availability.
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            className={`w-full py-4 mb-8 rounded-lg text-center font-medium text-lg transition-all ${
              isContinueEnabled()
                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isContinueEnabled() || submitting}
            onClick={handleContinue}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isRescheduleMode ? 'Rescheduling...' : 'Processing...'}
              </span>
            ) : (
              <>
                {isRescheduleMode ? 'Confirm Reschedule' : 'Continue'} 
                {!isRescheduleMode && isDiscountEligible && <span className="ml-1">(5% Discount Applied)</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    
  );
}

export default function DateTimeSelectionPage() {
  return (
    <Suspense fallback={<FancyLoader visible={true} message="Loading scheduling options..." />}>
      <DateTimeSelectionContent />
    </Suspense>
  );
}

