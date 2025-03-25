// src/components/ui/AddressCard.tsx
import React from 'react';
import { MapPin, Edit, Trash } from 'lucide-react';
import Card from './Card';

interface Address {
  _id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  selected = false,
  onPress,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      className={`${selected ? 'border-2 border-primary' : ''} hover:shadow-md transition-shadow`}
      onClick={onPress}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <MapPin size={20} className="text-primary mr-2" />
            <h3 className="font-semibold text-lg">{address.name}</h3>
          </div>
          {address.isDefault && (
            <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs font-medium rounded-full">
              Default
            </span>
          )}
        </div>
        
        <p className="text-sm text-textLight mb-1">{address.streetAddress}</p>
        <p className="text-sm text-textLight mb-3">
          {address.city}, {address.state} {address.zipCode}
        </p>
        
        <div className="flex justify-end space-x-2">
          {onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-textLight hover:text-primary"
            >
              <Edit size={18} />
            </button>
          )}
          
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-textLight hover:text-error"
            >
              <Trash size={18} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AddressCard;