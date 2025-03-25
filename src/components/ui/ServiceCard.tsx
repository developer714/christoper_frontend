// src/components/ui/ServiceCard.tsx
import React from 'react';
import { Home, Sparkles, CheckSquare, Package } from 'lucide-react';
import Card from './Card';

interface ServiceCardProps {
  service: {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    icon?: string;
  };
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const getIcon = () => {
    switch (service.icon) {
      case 'sparkles':
        return <Sparkles size={24} className="text-primary" />;
      case 'package':
        return <Package size={24} className="text-primary" />;
      case 'check-square':
        return <CheckSquare size={24} className="text-primary" />;
      default:
        return <Home size={24} className="text-primary" />;
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="p-4">
        <div className="mb-3 w-12 h-12 rounded-full bg-primaryLight bg-opacity-20 flex items-center justify-center">
          {getIcon()}
        </div>
        <h3 className="font-semibold text-lg text-text mb-1">{service.name}</h3>
        <p className="text-sm text-textLight mb-2 line-clamp-2">{service.description}</p>
        <div className="flex items-center text-primary font-medium">
          <span>From ${service.basePrice}</span>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;