// src/app/profile/addresses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addressAPI } from '@/services/api';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import Button from '@/components/ui/Button';
import AddressCard from '@/components/ui/AddressCard';
import { Plus } from 'lucide-react';
import FancyLoader from '@/components/ui/FancyLoader';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const addressesData = await addressAPI.getUserAddresses();
        setAddresses(addressesData);
      } catch (err: any) {
        setError('Failed to load addresses');
        console.error('Error fetching addresses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, isLoading, router]);

  const handleEditAddress = (addressId: string) => {
    router.push(`/profile/addresses/edit/${addressId}`);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await addressAPI.deleteAddress(addressId);
      setAddresses(addresses.filter(address => address._id !== addressId));
    } catch (err: any) {
      setError('Failed to delete address');
      console.error('Error deleting address:', err);
    }
  };

  if (isLoading || loading) {
    return <FancyLoader visible={true} message="Loading addresses..." />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text mb-2">My Addresses</h1>
          <p className="text-textLight">Manage your saved addresses</p>
        </div>

        <div className="mb-6">
          <Button
            title="Add New Address"
            variant="primary"
            icon={<Plus size={18} />}
            iconPosition="left"
            onClick={() => router.push('/profile/addresses/new')}
            fullWidth
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error bg-opacity-10 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map(address => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={() => handleEditAddress(address._id)}
                onDelete={() => handleDeleteAddress(address._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <p className="text-textLight mb-4">You don't have any saved addresses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}