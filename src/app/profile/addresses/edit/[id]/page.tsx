// src/app/profile/addresses/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { addressAPI } from '@/services/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import FancyLoader from '@/components/ui/FancyLoader';

export default function EditAddressPage() {
  const params = useParams();
  const addressId = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    squareFootage: 0,
    notes: '',
    isDefault: false
  });

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setLoading(true);
        const addresses = await addressAPI.getUserAddresses();
        const address = addresses.find((a: any) => a._id === addressId);
        
        if (!address) {
          setError('Address not found');
          return;
        }
        
        setFormData({
          name: address.name,
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          squareFootage: address.squareFootage,
          notes: address.notes || '',
          isDefault: address.isDefault || false
        });
      } catch (err) {
        console.error('Error fetching address:', err);
        setError('Failed to load address details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddress();
  }, [addressId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'squareFootage' 
          ? parseInt(value) || 0 
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      await addressAPI.updateAddress(addressId, formData);
      router.push('/booking/address');
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FancyLoader visible={true} message="Loading address..." />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-4 flex items-center">
          <Link href="/booking/address" className="mr-2">
            <ArrowLeft size={20} className="text-gray-800" />
          </Link>
          <h1 className="text-lg font-semibold">Edit Address</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pt-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Edit Address
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Form fields similar to your Add New Address form */}
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
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default address
              </label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/booking/address')}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}