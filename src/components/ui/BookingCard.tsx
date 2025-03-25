// src/components/ui/BookingCard.tsx
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import Card from './Card';

interface Booking {
  _id?: string;
  id?: string;
  serviceType: {
    name: string;
  };
  price: number;
  squareFootage: number;
  date: string;
  timeSlot: string;
  status: string;
  address?: {
    streetAddress: string;
  };
}

interface BookingCardProps {
  booking: Booking;
  onViewDetails: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onViewDetails }) => {
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-primary text-white';
      case 'pending':
        return 'bg-warning text-white';
      case 'completed':
        return 'bg-success text-white';
      case 'cancelled':
        return 'bg-error text-white';
      default:
        return 'bg-grayLight text-text';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewDetails}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-text">{booking.serviceType?.name || 'Cleaning Service'}</h3>
            <div className="text-sm text-textLight">
              ${booking.price} • {booking.squareFootage} sq ft
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Calendar size={16} className="text-primary mr-2 flex-shrink-0" />
            <span className="text-sm text-text">{formatDate(booking.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={16} className="text-primary mr-2 flex-shrink-0" />
            <span className="text-sm text-text">{booking.timeSlot}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin size={16} className="text-primary mr-2 flex-shrink-0" />
            <span className="text-sm text-text truncate">
              {booking.address?.streetAddress || 'Address not available'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookingCard;