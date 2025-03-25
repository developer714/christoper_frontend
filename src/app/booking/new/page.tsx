'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { serviceAPI } from '@/services/api';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import Button from '@/components/ui/Button';
import { ArrowLeft, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import useBookingStore from '@/store/bookingStore';
import Cookies from 'js-cookie';
import FancyLoader from '@/components/ui/FancyLoader';

export default function ServiceSelectionPage() {
  // Services and cleaning types
  const [cleaningTypes, setCleaningTypes] = useState([
    { id: 'standard', name: 'Standard Clean', description: 'Basic cleaning for regular maintenance', price: 98, icon: 'standard' },
    { id: 'deep', name: 'Deep Clean', description: 'Thorough cleaning for neglected areas', price: 145, icon: 'deep' },
    { id: 'move', name: 'Move In/Out', description: 'Complete cleaning for moving', price: 165, icon: 'move' },
    { id: 'party', name: 'Party Clean', description: 'Quick cleanup after events', price: 120, icon: 'party' },
    { id: 'office', name: 'Office Clean', description: 'Professional cleaning for workspaces', price: 110, icon: 'office' }
  ]);
  const [selectedCleaningType, setSelectedCleaningType] = useState<string | null>(null);
  
  // Square footage state
  const [squareFootageMode, setSquareFootageMode] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const setService = useBookingStore(state => state.setService);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Fetch services from API
    const fetchServices = async () => {
      try {
        const servicesData = await serviceAPI.getServices();
        if (servicesData && servicesData.length > 0) {
          // Map API data to our format if needed
          // setCleaningTypes(servicesData);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        // Continue with default data
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated, isLoading, router]);
  
  const handleCleaningTypeSelection = (typeId: string) => {
    setSelectedCleaningType(typeId);
  };
  
  const toggleSquareFootageMode = () => {
    setSquareFootageMode(!squareFootageMode);
  };
  
  const handleContinue = () => {
    if (!selectedCleaningType) return;
    
    const selectedType = cleaningTypes.find(type => type.id === selectedCleaningType);
    
    if (selectedType) {
      // Store service info in cookies
      Cookies.set('bookingService', JSON.stringify({
        serviceId: selectedType.id,
        serviceName: selectedType.name,
        serviceDescription: selectedType.description,
        basePrice: selectedType.price
      }));
      
      // Save to Zustand store
      setService({
        serviceId: selectedType.id,
        serviceName: selectedType.name,
        serviceDescription: selectedType.description,
        basePrice: selectedType.price
      });
      
      // Navigate to address selection
      router.push('/booking/address');
    }
  };

  if (isLoading || loading) {
    return <FancyLoader visible={true} message="Loading services..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="py-4 flex items-center border-b border-gray-200">
          <Link href="/" className="mr-2">
            <ArrowLeft size={20} className="text-gray-800" />
          </Link>
          <h1 className="text-lg font-semibold">Select Services</h1>
        </div>
        
        {/* Cleaning Type Selection */}
        <div className="py-4">
          <div className="flex items-center mb-4">
            <CheckSquare size={20} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold">Select Cleaning Type</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {cleaningTypes.slice(0, 4).map(type => (
              <div 
                key={type.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedCleaningType === type.id 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleCleaningTypeSelection(type.id)}
              >
                <h3 className="font-semibold">{type.name}</h3>
                <p className={`text-sm ${selectedCleaningType === type.id ? 'text-white' : 'text-gray-500'}`}>
                  {type.description}
                </p>
                <p className={`font-semibold mt-1 ${selectedCleaningType === type.id ? 'text-white' : 'text-blue-500'}`}>
                  ${type.price}
                </p>
              </div>
            ))}
          </div>
          
          {/* Office Clean */}
          <div 
            className={`border rounded-lg p-3 mb-6 cursor-pointer transition-colors ${
              selectedCleaningType === 'office' 
                ? 'border-blue-500 bg-blue-500 text-white' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleCleaningTypeSelection('office')}
          >
           <div className="flex items-center">
            <div>
              <h3 className="font-semibold">Office Clean</h3>
              <p className={`text-sm ${selectedCleaningType === 'office' ? 'text-white' : 'text-gray-500'}`}>
                Professional cleaning for workspaces
              </p>
            </div>
          </div>
        </div>
      </div>
        
        {/* Square Footage */}
        <div className="py-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold">Square Footage</h2>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-600">Square Footage Mode</p>
            <div 
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                squareFootageMode ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
              }`}
              onClick={toggleSquareFootageMode}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mb-4">
            Adjust the size of your space to get an accurate price estimate.
          </p>
        </div>
        
        {/* Continue Button */}
        <button
          className={`w-full py-4 rounded-lg text-center font-medium transition-colors ${
            selectedCleaningType 
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!selectedCleaningType}
          onClick={handleContinue}
        >
          Continue
        </button>
        </div>
    </div>
  );
}