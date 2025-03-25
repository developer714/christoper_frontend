// src/components/ui/CleaningTypeBubble.tsx
import React from 'react';
import { Home, Sparkles, CheckSquare, PartyPopper, Briefcase } from 'lucide-react';

interface CleaningTypeBubbleProps {
  type: string;
  label: string;
  selected?: boolean;
  onSelect: () => void;
}

export const CleaningTypeBubble: React.FC<CleaningTypeBubbleProps> = ({
  type,
  label,
  selected = false,
  onSelect,
}) => {
  // Function to determine which icon to show
  const getIcon = () => {
    switch (type) {
      case 'standard':
        return <Home size={24} className={selected ? 'text-white' : 'text-primary'} />;
      case 'deep':
        return <Sparkles size={24} className={selected ? 'text-white' : 'text-primary'} />;
      case 'move':
        return <Briefcase size={24} className={selected ? 'text-white' : 'text-primary'} />;
      case 'party':
        return <PartyPopper size={24} className={selected ? 'text-white' : 'text-primary'} />;
      case 'checklist':
        return <CheckSquare size={24} className={selected ? 'text-white' : 'text-primary'} />;
      default:
        return <Home size={24} className={selected ? 'text-white' : 'text-primary'} />;
    }
  };

  return (
    <div 
      className="cursor-pointer flex flex-col items-center" 
      onClick={onSelect}
    >
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors ${
          selected ? 'bg-primary' : 'bg-blue-100'
        }`}
      >
        {getIcon()}
      </div>
      <span className={`text-sm font-medium text-center ${selected ? 'text-primary' : 'text-text'}`}>
        {label}
      </span>
    </div>
  );
};

export default CleaningTypeBubble;