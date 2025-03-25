'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { serviceAPI } from '@/services/api';
import useServiceStore from '@/store/serviceStore';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { ArrowLeft, CheckSquare, Home, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import useBookingStore from '@/store/bookingStore';
import MembershipPopup from '@/components/popups/MembershipPopup';
import CleaningSuppliesModal from '@/components/ui/CleaningSuppliesModal';
import FancyLoader from '@/components/ui/FancyLoader';
import Cookies from 'js-cookie';
import Image from 'next/image';


export default function ServicePage() {
  // Services and cleaning types
  const [hours, setHours] = useState(2);
  const [selectedCleaningType, setSelectedCleaningType] = useState<string | null>(null);
  
  // Mode selection (Square Footage, Hourly, or Bed/Bath)
  const [selectedMode, setSelectedMode] = useState('sqft'); // 'sqft', 'hourly', or 'bedbath'
  const [squareFootage, setSquareFootage] = useState(1000);
  const [currentPrice, setCurrentPrice] = useState(98);
  
  // Bed/Bath counts
  const [bedCount, setBedCount] = useState(2);
  const [bathCount, setBathCount] = useState(1);
  
  // states to manage popup
  const [showMembershipPopup, setShowMembershipPopup] = useState(false);
  const [membershipFrequency, setMembershipFrequency] = useState<'weekly' | 'biweekly' | 'twice-weekly'>('weekly');
  
  // High messiness popup
  const [showHighMessinessPopup, setShowHighMessinessPopup] = useState(false);

  // states to manage cleaning supplies popup component
  const [showSuppliesModal, setShowSuppliesModal] = useState(false);
  const [suppliesOption, setSuppliesOption] = useState('bring-everything');
  const [selectedSupplies, setSelectedSupplies] = useState<string[]>([]);
  

  // Additional tasks state
  const [additionalTasks, setAdditionalTasks] = useState([
    { id: 'oven', name: 'Inside Oven', price: 30, time: 30, count: 0, type: 'add' },
    { id: 'fridge', name: 'Inside Fridge', price: 30, time: 30, count: 0, type: 'add' },
    { id: 'cabinets', name: 'Inside Cabinets', price: 15, time: 15, count: 0, type: 'count' },
    { id: 'laundry', name: 'Laundry', price: 20, time: 30, count: 0, type: 'count' }
  ]);
  
  // Messiness scale
  const [messiness, setMessiness] = useState(3);
  
  // Frequency options
  const [frequency, setFrequency] = useState('one-time');
  const frequencies = [
    { id: 'one-time', name: 'One-time', description: 'Single cleaning service', discount: 0 },
    { id: 'biweekly', name: 'Biweekly', description: 'Every two weeks', discount: 10 },
    { id: 'weekly', name: 'Weekly', description: 'Once every week', discount: 15 },
    { id: 'twice-weekly', name: 'Twice a week', description: 'Two times per week', discount: 20 }
  ];
  
  // Pets
  const [pets, setPets] = useState<string[]>([]);
  
  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Cleaning time calculation
  const [cleaningTime, setCleaningTime] = useState("2 hours");
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const setService = useBookingStore(state => state.setService);
  const setDetails = useBookingStore(state => state.setDetails);

  // Service store
  const { serviceTypes, fetchServiceTypes, isLoading: servicesLoading } = useServiceStore();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Element refs for scrolling
  const squareFootageRef = useRef<HTMLDivElement>(null);
  const additionalTasksRef = useRef<HTMLDivElement>(null);
  const messinessRef = useRef<HTMLDivElement>(null);
  const frequencyRef = useRef<HTMLDivElement>(null);
  const petsRef = useRef<HTMLDivElement>(null);

  // Add this to the beginning of the component, after the state declarations
useEffect(() => {
  // Check if a service was selected from the Services page
  const bookingServiceCookie = Cookies.get('bookingService');
  if (bookingServiceCookie) {
    try {
      const bookingService = JSON.parse(bookingServiceCookie);
      if (bookingService.serviceId) {
        setSelectedServiceId(bookingService.serviceId);
        
        // For backward compatibility, also set the cleaning type code
        if (bookingService.serviceCode) {
          setSelectedCleaningType(bookingService.serviceCode);
        }
      }
    } catch (err) {
      console.error('Error parsing booking service cookie:', err);
    }
  }
}, []);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      // Fetch service types from the API
      fetchServiceTypes().then(() => {
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
    }
  }, [isAuthenticated, isLoading, router, fetchServiceTypes]);
  
  // Calculate price based on selected service, square footage/hours, and additional features
  useEffect(() => {
    if (!selectedServiceId) return;
    
    let basePrice = 0;
    const selectedService = serviceTypes.find(service => service._id === selectedServiceId);
    
    if (selectedMode === 'hourly') {
      // Hourly pricing: $50 per hour baseline
      basePrice = hours * 50;
    } else if (selectedMode === 'bedbath') {
      // Bed/Bath pricing: $50 per bedroom + $30 per bathroom
      basePrice = (bedCount * 50) + (bathCount * 30);
      
      // Apply service type multiplier if service exists
      if (selectedService) {
        const serviceCode = selectedService.code || 'standard';
        
        switch (serviceCode) {
          case 'deep':
          case 'party':
            basePrice = basePrice * 1.5; // 50% more for deep or party clean
            break;
          case 'move':
            basePrice = basePrice * 2; // Double for move in/out clean
            break;
          case 'office':
            basePrice = basePrice * 1.15; // 15% more for office clean
            break;
        }
      }
    } else {
      // Square footage pricing based on equations
      const sqft = squareFootage;
      
      if (selectedService) {
        const serviceCode = selectedService.code || 'standard';
        
        switch (serviceCode) {
          case 'standard':
            basePrice = 37.4785 + 0.060375 * sqft;
            break;
          case 'deep':
          case 'party':
            basePrice = 48.885 + 0.09225 * sqft;
            break;
          case 'move':
            basePrice = 65.18 + 0.123 * sqft;
            break;
          case 'office':
            // Office clean is 15% more than standard
            basePrice = (37.4785 + 0.060375 * sqft) * 1.15;
            break;
          default:
            // Use the base price from the service if available
            basePrice = (selectedService.basePrice || 98) * (sqft / 1000);
        }
      }
    }
    
    // Round to integer
    basePrice = Math.round(basePrice);
    
    // Add additional tasks
    const additionalTasksPrice = additionalTasks.reduce((sum, task) => {
      return sum + (task.price * (task.count > 0 ? task.count : (task.type === 'add' && task.count > 0 ? 1 : 0)));
    }, 0);
    
    // Apply messiness multiplier (each level above 3 adds 5% to the price)
    const messinessMultiplier = 1 + Math.max(0, (messiness - 3) * 0.05);
    
    // Calculate total price with messiness factor
    let totalPrice = (basePrice + additionalTasksPrice) * messinessMultiplier;
    
    // Apply discount based on frequency
    const selectedFrequency = frequencies.find(f => f.id === frequency);
    if (selectedFrequency && selectedFrequency.discount > 0) {
      totalPrice = totalPrice * (1 - selectedFrequency.discount / 100);
    }
    
    // Round to integer
    totalPrice = Math.round(totalPrice);
    
    // Update the current price
    setCurrentPrice(totalPrice);
    
    // Calculate cleaning time
    let totalMinutes = 0;
    
    if (selectedMode === 'hourly') {
      totalMinutes = hours * 60;
    } else if (selectedMode === 'bedbath') {
      // Base time calculation: 30 minutes per bedroom + 20 minutes per bathroom
      totalMinutes = (bedCount * 30) + (bathCount * 20);
      
      // Minimum 1 hour
      totalMinutes = Math.max(60, totalMinutes);
    } else {
      // Base time calculation from square footage (1000 sqft ≈ 2 hours)
      totalMinutes = Math.round((squareFootage / 1000) * 120);
      
      // Minimum 1 hour
      totalMinutes = Math.max(60, totalMinutes);
    }
    
    // Add time for additional tasks
    const additionalTasksTime = additionalTasks.reduce((sum, task) => {
      return sum + (task.time * (task.count > 0 ? task.count : (task.type === 'add' && task.count > 0 ? 1 : 0)));
    }, 0);
    
    totalMinutes += additionalTasksTime;
    
    // Adjust time based on messiness (each level above 3 adds 10% to the time)
    const messinessTimeMultiplier = 1 + Math.max(0, (messiness - 3) * 0.1);
    totalMinutes = Math.round(totalMinutes * messinessTimeMultiplier);
    
    // Update the cleaning time string
    const hoursValue = Math.floor(totalMinutes / 60);
    const minutesValue = totalMinutes % 60;
    
    if (minutesValue === 0) {
      setCleaningTime(`${hoursValue} hours`);
    } else {
      setCleaningTime(`${hoursValue} hours ${minutesValue} min`);
    }
    
  }, [selectedServiceId, serviceTypes, squareFootage, hours, selectedMode, bedCount, bathCount, additionalTasks, messiness, frequency]);
  
  // Handle selection of a service by MongoDB ObjectId
  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    
    // For backward compatibility, find the corresponding cleaning type code
    const selectedService = serviceTypes.find(service => service._id === serviceId);
    if (selectedService && selectedService.code) {
      setSelectedCleaningType(selectedService.code);
    }
    
    // Scroll to square footage section
    setTimeout(() => {
      if (squareFootageRef.current) {
        squareFootageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  // This is for backward compatibility
  const handleCleaningTypeSelection = (typeId: string) => {
    setSelectedCleaningType(typeId);
    
    // Find the service with this code and select its ID
    const matchingService = serviceTypes.find(service => service.code === typeId);
    if (matchingService) {
      setSelectedServiceId(matchingService._id);
    }
    
    // Scroll to square footage section
    setTimeout(() => {
      if (squareFootageRef.current) {
        squareFootageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  const handleModeSelection = (mode: string) => {
    setSelectedMode(mode);
  };
  
  const handleSquareFootageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setSquareFootage(value);
    }
  };
  
  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setHours(value);
    }
  };
  
  const handleBedCountChange = (value: number) => {
    if (value >= 1) {
      setBedCount(value);
    }
  };
  
  const handleBathCountChange = (value: number) => {
    if (value >= 1) {
      setBathCount(value);
    }
  };
  
  const handleAdditionalTaskAdd = (taskId: string) => {
    setAdditionalTasks(tasks => 
      tasks.map(task => 
        task.id === taskId && task.type === 'add' 
          ? { ...task, count: task.count > 0 ? 0 : 1 } // Toggle on/off
          : task
      )
    );
  };
  
  const handleAdditionalTaskIncrement = (taskId: string) => {
    setAdditionalTasks(tasks => 
      tasks.map(task => 
        task.id === taskId && task.type === 'count' 
          ? { ...task, count: task.count + 1 } 
          : task
      )
    );
  };
  
  const handleAdditionalTaskDecrement = (taskId: string) => {
    setAdditionalTasks(tasks => 
      tasks.map(task => 
        task.id === taskId && task.type === 'count' && task.count > 0
          ? { ...task, count: task.count - 1 } 
          : task
      )
    );
  };
  
  const handleMessinessChange = (level: number) => {
    setMessiness(level);
    
    // If messiness level is 6 or higher, auto-select deep clean and show popup
    if (level >= 6) {
      // Find the deep cleaning service
      const deepCleanService = serviceTypes.find(service => service.code === 'deep');
      if (deepCleanService) {
        setSelectedServiceId(deepCleanService._id);
        setSelectedCleaningType('deep');
        setShowHighMessinessPopup(true);
      }
    }
  };
  
  const handleFrequencyChange = (frequencyId: string) => {
    setFrequency(frequencyId);
     // Show membership popup for recurring plans
    if (frequencyId === 'weekly' || frequencyId === 'biweekly' || frequencyId === 'twice-weekly') {
      setMembershipFrequency(frequencyId as 'weekly' | 'biweekly' | 'twice-weekly');
      setShowMembershipPopup(true);
    }
  };
  
  const togglePet = (petType: string) => {
    if (pets.includes(petType)) {
      setPets(pets.filter(pet => pet !== petType));
    } else {
      setPets([...pets, petType]);
    }
  };
  
  const handleSpecialInstructionsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSpecialInstructions(event.target.value);
  };

  const handleSaveSupplies = (option: string, supplies: string[]) => {
    setSuppliesOption(option);
    setSelectedSupplies(supplies);
    
    // Calculate the discount based on the option
    let suppliesDiscount = 0;
    if (option === 'i-have-vacuum') {
      suppliesDiscount = 20;
    } else if (option === 'i-have-all') {
      suppliesDiscount = 50;
    }
    
    // Save to state and store
    setDetails({
      suppliesOption: option,
      selectedSupplies: supplies,
      suppliesDiscount: suppliesDiscount
    });
  };
  
  useEffect(() => {
    if (!selectedServiceId) return;
    
    // Find the selected service
    const selectedService = serviceTypes.find(service => service._id === selectedServiceId);
    if (!selectedService || !selectedService.code) return;
    
    // For deep clean, move-in/out, or party clean, auto-select certain add-ons
    if (['deep', 'move', 'party'].includes(selectedService.code)) {
      // Auto-select items that are included in premium cleaning packages
      setAdditionalTasks(tasks => 
        tasks.map(task => {
          if (task.id === 'oven' || task.id === 'fridge') {
            // These are binary toggle tasks
            return { ...task, count: 1 };
          } else if (task.id === 'cabinets' || task.id === 'laundry') {
            // These are count-based tasks
            return { ...task, count: 1 };
          }
          return task;
        })
      );
    } else {
      // For standard clean, reset to default values
      setAdditionalTasks(tasks => 
        tasks.map(task => ({ ...task, count: 0 }))
      );
    }
  }, [selectedServiceId, serviceTypes]);

  const handleContinue = () => {
    console.log("handleContinue called");
    
    if (!selectedServiceId) {
      console.log("No service selected");
      setError("Please select a cleaning service to continue");
      return;
    }

    console.log("Selected serviceId:", selectedServiceId);
    
    // Find the selected service by its ID
    const selectedService = serviceTypes.find(service => service._id === selectedServiceId);
    console.log("Found service:", selectedService);
    
    if (selectedService) {
      console.log("Setting service data...");
      setService({
        serviceId: selectedService._id,
        serviceName: selectedService.name,
        serviceDescription: selectedService.description || '',
        basePrice: currentPrice,
        serviceCode: selectedService.code // Add the code for compatibility
      });

      console.log("Setting additional details...");
      setDetails({
        hasPets: pets.length > 0,
        messiness: messiness,
        frequency: frequency as any,
        notes: specialInstructions,
        suppliesOption: suppliesOption || 'bring-everything',
        selectedSupplies: selectedSupplies || [],
        bedCount: selectedMode === 'bedbath' ? bedCount : undefined,
        bathCount: selectedMode === 'bedbath' ? bathCount : undefined
      });
    
      console.log("Setting cleaning time cookie...");
      Cookies.set('cleaningTime', cleaningTime);
      
      console.log("About to navigate to datetime page...");
      // Store service info in cookies with both ID and code
      Cookies.set('bookingService', JSON.stringify({
        serviceId: selectedService._id,
        serviceName: selectedService.name,
        serviceDescription: selectedService.description || '',
        basePrice: currentPrice,
        serviceCode: selectedService.code // Include code for backward compatibility
      }), { expires: 7 });

      
      console.log("Navigation called");
      setShowSuppliesModal(true);
    } else {
      console.log("Service not found");
      setError("Could not find selected service. Please try again.");
    }
  };

  // Get compatibility mapping between new MongoDB ObjectIds and old string codes
  const getServiceByCode = (code: string) => {
    return serviceTypes.find(service => service.code === code);
  };

  if (isLoading || loading || servicesLoading) {
    return <FancyLoader visible={true} message="Loading services..." />;
  }

  // Construct our list of service types for the UI
  const displayableServiceTypes = serviceTypes.filter(service => service.code && ['standard', 'deep', 'move', 'party', 'office'].includes(service.code));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="py-4 flex items-center border-b border-gray-200 px-4">
          <Link href="/booking/address" className="mr-2">
            <ArrowLeft size={20} className="text-gray-800" />
          </Link>
          <h1 className="text-xl font-semibold">Select Services</h1>
        </div>
        
        <div className="px-4">
          {/* Cleaning Type Selection */}
          <div className="py-4">
            <div className="flex items-center mb-4">
              <CheckSquare className="text-blue-500 mr-2" size={20} />
              <h2 className="text-xl font-semibold text-gray-800">Select Cleaning Type</h2>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Service Type Cards - Use ObjectIds from serviceTypes */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {displayableServiceTypes.filter(service => service.code !== 'office').map(service => (
                <div 
                  key={service._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedServiceId === service._id 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                  }`}
                  onClick={() => handleServiceSelection(service._id)}
                >
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className={`text-sm ${selectedServiceId === service._id ? 'text-white' : 'text-gray-500'}`}>
                    {service.description}
                  </p>
                  <p className={`font-semibold mt-1 ${selectedServiceId === service._id ? 'text-white' : 'text-blue-500'}`}>
                    ${service.basePrice}
                  </p>
                </div>
              ))}
            </div>
              
            {/* Office Clean */}
            {displayableServiceTypes.filter(service => service.code === 'office').map(service => (
              <div 
                key={service._id}
                className={`border rounded-lg p-4 mb-6 cursor-pointer transition-colors ${
                  selectedServiceId === service._id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleServiceSelection(service._id)}
              >
                <div className="flex items-start">
                  <div className="text-gray-500 mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8H8v-8Z" /><path d="M7 6h.01M11 6h.01M15 6h.01" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
            {/* Selected Cleaning Type Display */}
            {selectedServiceId && getServiceByCode('office')?._id === selectedServiceId && (
                <div className="py-4 border-b border-gray-100">
                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8H8v-8Z" /><path d="M7 6h.01M11 6h.01M15 6h.01" /></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Office Clean</h3>
                        <p className="text-sm text-gray-500">Professional cleaning for workspaces</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Square Footage / Hourly / Bed Bath Mode Selection */}
              <div className="py-4 border-b border-gray-100" ref={squareFootageRef}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-lg text-gray-800">
                    Select Calculation Mode
                  </span>
                </div>
                
                {/* Mode Selection Tabs */}
                <div className="flex border border-gray-200 rounded-lg mb-4">
                  <div 
                    className={`flex-1 py-2 px-3 text-center cursor-pointer ${
                      selectedMode === 'sqft' 
                        ? 'bg-blue-500 text-white font-medium rounded-l-lg' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => handleModeSelection('sqft')}
                  >
                    Square Ft
                  </div>
                  <div 
                    className={`flex-1 py-2 px-3 text-center cursor-pointer ${
                      selectedMode === 'hourly' 
                        ? 'bg-blue-500 text-white font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => handleModeSelection('hourly')}
                  >
                    Hourly
                  </div>
                  <div 
                    className={`flex-1 py-2 px-3 text-center cursor-pointer ${
                      selectedMode === 'bedbath' 
                        ? 'bg-blue-500 text-white font-medium rounded-r-lg' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => handleModeSelection('bedbath')}
                  >
                    Bed/Bath
                  </div>
                </div>
                
                {selectedMode === 'sqft' && (
                  <>
                    <div className="text-gray-600 mb-3">
                      Adjust the size of your space to get an accurate price estimate.
                    </div>
                    <div className="flex justify-between mb-2 text-sm text-gray-500">
                      <span>100 sq ft</span>
                      <span>10,000 sq ft</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="10000" 
                      value={squareFootage} 
                      onChange={handleSquareFootageChange}
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer mb-4"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">{squareFootage} sq ft</span>
                      <span className="font-semibold text-gray-700">Current Price: <span className="text-blue-500">${currentPrice}</span></span>
                    </div>
                  </>
                )}
                
                {selectedMode === 'hourly' && (
                  <>
                    <p className="text-gray-600 mb-3">
                      Select how many hours you need for cleaning.
                    </p>
                    <div className="flex justify-between mb-2 text-sm text-gray-500">
                      <span>2 hours</span>
                      <span>20 hours</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="20" 
                      value={hours} 
                      onChange={handleHoursChange}
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer mb-4"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">{hours} hours</span>
                      <span className="font-semibold text-gray-700">Current Price: <span className="text-blue-500">${currentPrice}</span></span>
                    </div>
                  </>
                )}
                
                {selectedMode === 'bedbath' && (
                  <>
                    <p className="text-gray-600 mb-3">
                      Select the number of bedrooms and bathrooms in your space.
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-gray-700 font-medium">Bedrooms</label>
                        <div className="flex items-center space-x-3">
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-blue-500 hover:text-white"
                            onClick={() => handleBedCountChange(bedCount - 1)}
                            disabled={bedCount <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{bedCount}</span>
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-blue-500 hover:text-white"
                            onClick={() => handleBedCountChange(bedCount + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <label className="text-gray-700 font-medium">Bathrooms</label>
                        <div className="flex items-center space-x-3">
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-blue-500 hover:text-white"
                            onClick={() => handleBathCountChange(bathCount - 1)}
                            disabled={bathCount <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{bathCount}</span>
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-blue-500 hover:text-white"
                            onClick={() => handleBathCountChange(bathCount + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-gray-800">{bedCount} bed, {bathCount} bath</span>
                      <span className="font-semibold text-gray-700">Current Price: <span className="text-blue-500">${currentPrice}</span></span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Max Clean Time */}
              <div className="py-4 border-b border-gray-100">
                <div className="flex items-center mb-3">
                  <Clock size={20} className="text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Max Clean Time</h2>
                </div>
                
                <div className="flex items-start mb-3">
                  <div className="bg-blue-100 p-3 rounded-full mr-3">
                    <Clock size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-500">{cleaningTime}</p>
                    <p className="text-gray-500 text-sm">
                      Maximum cleaning time
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm italic">
                  Note: All cleanings must finish by 6:00 PM. This will limit your available time slots.
                </p>
              </div>


              {/* Additional Tasks */}
              <div className="py-4 border-b border-gray-100" ref={additionalTasksRef}>
                <div className="flex items-center mb-4">
                  <CheckSquare size={20} className="text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Additional Tasks?</h2>
                </div>
                
                {additionalTasks.map(task => (
                  <div key={task.id} className="py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-800">{task.name}</h3>
                            
                            {/* Add tooltips for tasks that need clarification */}
                            {task.id === 'cabinets' && (
                              <div className="relative ml-2 group">
                                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 cursor-help text-xs">
                                  ?
                                </div>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-48 z-10">
                                  Price is per cabinet. Standard cleaning includes exterior only. Deep, Move-in/out, and Party cleanings include 1 cabinet interior.
                                </div>
                              </div>
                            )}
                            
                            {task.id === 'laundry' && (
                              <div className="relative ml-2 group">
                                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 cursor-help text-xs">
                                  ?
                                </div>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-48 z-10">
                                  Price is per load. Deep, Move-in/out, and Party cleanings include 1 load.
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">${task.price} {task.type === 'count' ? 'each' : ''}</p>
                          <p className="text-sm text-blue-500">+{task.time} min {task.type === 'count' ? 'each' : ''}</p>
                        </div>
                      </div>
                      
                      {task.type === 'add' ? (
                        <button 
                          className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
                            task.count > 0 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}
                          onClick={() => handleAdditionalTaskAdd(task.id)}
                        >
                          {task.count > 0 ? 'Added' : 'Add'}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-blue-500"
                            onClick={() => handleAdditionalTaskDecrement(task.id)}
                            disabled={task.count === 0}
                          >
                            -
                          </button>
                          <span className="w-6 text-center">{task.count}</span>
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-blue-500"
                            onClick={() => handleAdditionalTaskIncrement(task.id)}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Show included message for premium services and selected tasks */}
                    {task.count > 0 && selectedCleaningType && ['deep', 'move', 'party'].includes(selectedCleaningType) && (
                      <div className="mt-1 text-green-500 text-xs font-medium">
                        Included with {selectedCleaningType === 'deep' ? 'Deep Clean' : selectedCleaningType === 'move' ? 'Move In/Out Clean' : 'Party Clean'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Messiness Scale */}
              <div className="py-4 border-b border-gray-100" ref={messinessRef}>
                <div className="flex items-center mb-3">
                  <Info className="text-blue-500 mr-2" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">How messy is your space?</h2>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  This helps us prepare the right cleaning supplies and allocate enough time.
                </p>
                
                <div className="mb-2 flex justify-between text-sm text-gray-500">
                  <span>Tidy</span>
                  <span>Very Messy</span>
                </div>
                
                <div className="flex justify-between mb-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => {
                    let bgColor = '';
                    let textColor = '';
                    
                    if (messiness === level) {
                      if (level <= 4) {
                        bgColor = 'bg-green-200';
                        textColor = 'text-green-800';
                      } else if (level <= 6) {
                        bgColor = 'bg-orange-500';
                        textColor = 'text-white';
                      } else {
                        bgColor = 'bg-red-500';
                        textColor = 'text-white';
                      }
                    } else {
                      if (level <= 4) {
                        bgColor = 'bg-green-200';
                        textColor = 'text-green-800';
                      } else if (level <= 6) {
                        bgColor = 'bg-orange-200';
                        textColor = 'text-orange-800';
                      } else {
                        bgColor = 'bg-red-200';
                        textColor = 'text-red-800';
                      }
                    }
                    
                    return (
                      <button 
                        key={level}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer font-medium ${bgColor} ${textColor}`}
                        onClick={() => handleMessinessChange(level)}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-gray-500 text-sm italic">
                  {messiness >= 6 
                    ? "Deep cleaning is required for this level of messiness." 
                    : "Standard cleaning should be sufficient."}
                </p>
              </div>
              
              {/* Cleaning Frequency */}
              <div className="py-4 border-b border-gray-100" ref={frequencyRef}>
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2"><path d="M17 2v4" /><path d="M7 2v4" /><path d="M17 18a2 2 0 0 1-4 0" /><rect x="3" y="6" width="18" height="14" rx="2" /></svg>
                  <h2 className="text-lg font-semibold text-gray-800">How often do you need cleaning?</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4 ">
                  {[
                    { id: 'one-time', name: 'One-time', description: 'Single cleaning service', discount: 0 },
                    { id: 'biweekly', name: 'Biweekly', description: 'Every two weeks', discount: 10 },
                    { id: 'weekly', name: 'Weekly', description: 'Once every week', discount: 15 },
                    { id: 'twice-weekly', name: 'Twice a week', description: 'Two times per week', discount: 20 }
                  ].map(option => (
                    <div 
                      key={option.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        frequency === option.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                      }`}
                      onClick={() => handleFrequencyChange(option.id)}
                    >
                      <h3 className={`font-semibold ${frequency === option.id && option.id === 'one-time' ? 'text-blue-500' : 'text-gray-800'}`}>
                        {option.name}
                      </h3>
                      {option.discount > 0 && (
                        <p className="text-green-500 text-sm font-medium">Save {option.discount}%</p>
                      )}
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pets */}
              <div className="py-4 border-b border-gray-100" ref={petsRef}>
                <div className="flex items-center mb-3">
                  <span className="text-blue-500 mr-2">🐾</span>
                  <h2 className="text-lg font-semibold text-gray-800">Do you have pets?</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Dog */}
                  <div 
                    className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                      pets.includes('dog') 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                    }`}
                    onClick={() => togglePet('dog')}
                  >
                    <span className="inline-block">
                      <Image 
                        src="/dog.png"  // Or wherever dog.png is located
                        alt="Dog"
                        width={32}
                        height={32}
                      />
                    </span>
                    <p className="mt-2 text-sm font-medium text-gray-800">Dog</p>
                  </div>

                  {/* Cat */}
                  <div 
                    className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                      pets.includes('cat') 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                    }`}
                    onClick={() => togglePet('cat')}
                  >
                    <span className="inline-block">
                      <Image
                        src="/cat.png"  // Or wherever cat.png is located
                        alt="Cat"
                        width={32}
                        height={32}
                      />
                    </span>
                    <p className="mt-2 text-sm font-medium text-gray-800">Cat</p>
                  </div>

                  {/* Other */}
                  <div 
                    className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                      pets.includes('other') 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                    }`}
                    onClick={() => togglePet('other')}
                  >
                    <span className="inline-block">
                      ?
                    </span>
                    <p className="mt-2 text-sm font-medium text-gray-800">Other</p>
                  </div>
                </div>
              </div>

              
              {/* Special Instructions */}
              <div className="py-4 border-b border-gray-100">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><line x1="9" y1="9" x2="10" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>
                  <h2 className="text-lg font-semibold text-gray-800">Special Instructions</h2>
                </div>
                
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg h-24 text-gray-700"
                  placeholder="Add any special instructions or notes for the cleaner..."
                  value={specialInstructions}
                  onChange={handleSpecialInstructionsChange}
                />
              </div>
          
          {/* Continue Button */}
          <button
            className="w-full py-4 mb-20 bg-blue-500 text-white rounded-[36px] text-center font-medium my-8 transition-colors hover:bg-blue-600 hover:scale-105 cursor-pointer"
            onClick={handleContinue}
            disabled={!selectedServiceId}
          >
            Continue
          </button>
        </div>
      </div>
      
      {/* Membership Popup */}
      <MembershipPopup 
        isOpen={showMembershipPopup}
        onClose={() => setShowMembershipPopup(false)}
        frequency={membershipFrequency}
      />
      
      {/* High Messiness Popup */}
      {showHighMessinessPopup && (
        <div className="fixed inset-0 bg-backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Info size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Deep Clean Required</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Based on your messiness rating, we've automatically selected our Deep Clean service. 
              Spaces with high messiness levels require our professional deep cleaning approach 
              to ensure the best results.
            </p>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-blue-700 font-medium">
                Deep Clean includes thorough attention to all surfaces, inside appliances, 
                and detailed cleaning that standard service doesn't cover.
              </p>
            </div>
            
            <button
              className="w-full py-3 bg-blue-500 text-white rounded-md text-center font-medium transition-colors hover:bg-blue-600 cursor-pointer"
              onClick={() => setShowHighMessinessPopup(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
      
      <CleaningSuppliesModal
        isOpen={showSuppliesModal}
        onClose={() => {
          console.log("Modal closed");
          setShowSuppliesModal(false);
        }}
        onSave={(option, supplies) => {
          console.log("Modal saved, navigating to datetime page...");
          handleSaveSupplies(option, supplies);
          // Add a delay before navigation
          setTimeout(() => {
            console.log("Navigating to /booking/datetime");
            router.push('/booking/datetime');
          }, 100);
        }}
      />
    </div>
  );
}