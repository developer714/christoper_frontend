'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addressAPI } from '@/services/api';
import { ArrowLeft, Home, ChevronRight, PenLine, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import Cookies from 'js-cookie';
import FancyLoader from '@/components/ui/FancyLoader';

export default function AddressSelectionPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    squareFootage: 1000,
    notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if service is selected
    const serviceData = Cookies.get('bookingService');
    if (!serviceData) {
      // If no service is selected, go back to home
      router.push('/booking/new');
      return;
    }

    if (!isLoading && !isAuthenticated) {
      
      router.push('/auth/login');
    }


    const fetchAddresses = async () => {
      setLoading(true);
      try {
        // Get real addresses from the backend API
        const addressesData = await addressAPI.getUserAddresses();
        setAddresses(addressesData);
        
        // Check if there's a previously selected address
        const storedAddress = Cookies.get('bookingAddress');
        if (storedAddress) {
          try {
            const parsed = JSON.parse(storedAddress);
            setSelectedAddressId(parsed.addressId);
          } catch (e) {
            console.error('Error parsing stored address:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, isLoading, router]);

  const handleAddressSelect = (address: any) => {
    setSelectedAddressId(address._id);
    
    // Store selected address in cookies for next booking step
    Cookies.set('bookingAddress', JSON.stringify({
      addressId: address._id,
      name: address.name,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      squareFootage: address.squareFootage,
      notes: address.notes || ''
    }));
  };

  const handleContinue = () => {
    if (selectedAddressId) {
      router.push('/booking/services');
    } else {
      // Scroll to addresses section to prompt selection
      document.getElementById('addresses-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddNewAddressClick = () => {
    setShowNewAddressForm(true);
  };

  const handleEditAddress = (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation(); // Prevent selecting the address when clicking edit
    router.push(`/profile/addresses/edit/${addressId}`);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'squareFootage' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmitNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Simple validation
    if (!formData.name || !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      // Save the new address via API
      const newAddress = await addressAPI.createAddress(formData);
      
      // Add to list and select it
      setAddresses(prev => [...prev, newAddress]);
      handleAddressSelect(newAddress);
      
      // Hide the form
      setShowNewAddressForm(false);
      setFormData({
        name: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        squareFootage: 1000,
        notes: ''
      });
    } catch (error) {
      console.error('Error creating address:', error);
      setFormError('Error creating address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelNewAddress = () => {
    setShowNewAddressForm(false);
    setFormError(null);
  };

  if (isLoading || loading) {
    return <FancyLoader visible={true} message="Loading addresses..." />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-4 flex items-center">
          <Link href="/booking/new" className="mr-2">
            <ArrowLeft size={20} className="text-gray-800" />
          </Link>
          <h1 className="text-lg font-semibold">Select Address</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pt-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Where do you need cleaning?
        </h2>
        <p className="text-gray-500 mb-6">
          Select an address for your cleaning service
        </p>

        {/* Address Cards */}
        <div className="space-y-4" id="addresses-section">
          {addresses.length > 0 ? (
            addresses.map(address => (
              <div 
                key={address._id} 
                className={`bg-white rounded-lg border overflow-hidden transition-colors ${
                  selectedAddressId === address._id 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer flex items-start justify-between transition-colors" 
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="flex">
                    <div className="mr-3 mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedAddressId === address._id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-100 text-blue-500'
                      }`}>
                        <Home size={20} />
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{address.name}</div>
                      <div className="text-sm text-blue-500 font-medium">{address.squareFootage} sq ft</div>
                      <div className="text-sm mt-2 text-gray-600">
                        {address.streetAddress}, {address.city}, {address.state} {address.zipCode}
                      </div>
                      {address.notes && (
                        <div className="text-sm text-gray-500 italic mt-1">
                          Note: {address.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedAddressId === address._id ? (
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="border-t border-gray-200 px-4 py-2 flex justify-end">
                  <button 
                    className="text-blue-500 flex items-center text-sm font-medium"
                    onClick={(e) => handleEditAddress(e, address._id)}
                  >
                    <PenLine size={16} className="mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <MapPin size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-2">No addresses found</p>
              <p className="text-gray-500 text-sm mb-4">Please add an address to continue</p>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors"
                onClick={handleAddNewAddressClick}
              >
                Add New Address
              </button>
            </div>
          )}
        </div>

        {/* Add New Address Button */}
        {addresses.length > 0 && !showNewAddressForm && (
          <div className="mt-6">
            <button 
              className="w-full border border-blue-500 text-blue-500 rounded-lg py-3 flex items-center justify-center font-medium hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
              onClick={handleAddNewAddressClick}
            >
              <Plus size={20} className="mr-2" />
              Add New Address
            </button>
          </div>
        )}

        {/* New Address Form */}
        {showNewAddressForm && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Address</h3>
              <button 
                className="text-gray-500"
                onClick={cancelNewAddress}
              >
                &times;
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmitNewAddress}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Home, Office, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address*
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code*
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Footage*
                    </label>
                    <input
                      type="number"
                      name="squareFootage"
                      value={formData.squareFootage}
                      onChange={handleInputChange}
                      placeholder="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for finding or accessing this location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={cancelNewAddress}
                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:scale-105 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 hover:scale-105 cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Continue Button - Only show if we have addresses and not showing the form */}
        {addresses.length > 0 && !showNewAddressForm && (
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={handleContinue}
              disabled={!selectedAddressId}
              className={`w-full py-4 rounded-[36px] text-white font-medium transition-colors cursor-pointer hover:scale-105 ${
                selectedAddressId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}