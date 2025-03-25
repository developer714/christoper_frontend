// src/components/ui/CleaningTypeCard.tsx
import React from 'react';
import { Home, Sparkles, CheckSquare, PartyPopper, Briefcase } from 'lucide-react';
import Card from './Card';

interface CleaningTypeCardProps {
  type: string;
  title: string;
  description: string;
  price: number;
  selected?: boolean;
  onSelect: () => void;
}

export const CleaningTypeCard: React.FC<CleaningTypeCardProps> = ({
  type,
  title,
  description,
  price,
  selected = false,
  onSelect,
}) => {
  // Function to determine which icon to show
  const getIcon = () => {
    switch (type) {
      case 'standard':
        return <Home size={24} className="text-primary" />;
      case 'deep':
        return <Sparkles size={24} className="text-primary" />;
      case 'move':
        return <Briefcase size={24} className="text-primary" />;
      case 'party':
        return <PartyPopper size={24} className="text-primary" />;
      case 'checklist':
        return <CheckSquare size={24} className="text-primary" />;
      default:
        return <Home size={24} className="text-primary" />;
    }
  };

  return (
    <Card 
      className={`cursor-pointer ${selected ? 'border-2 border-primary' : ''}`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              {getIcon()}
            </div>
            <h3 className="font-semibold text-lg text-text">{title}</h3>
          </div>
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
            selected 
              ? 'bg-primary border-primary' 
              : 'border-gray-300'
          }`}>
            {selected && (
              <CheckSquare size={14} className="text-white" />
            )}
          </div>
        </div>
        <p className="text-sm text-textLight mb-3">{description}</p>
        <div className="text-primary font-medium">
          From ${price}
        </div>
      </div>
    </Card>
  );
};

export default CleaningTypeCard;