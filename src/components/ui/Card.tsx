// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: number;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  elevation = 1,
  onClick
}) => {
  // Map elevation to Tailwind shadow classes
  const shadowMap = {
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
    5: 'shadow-xl'
  };
  
  const shadowClass = shadowMap[elevation as keyof typeof shadowMap] || 'shadow';
  
  return (
    <div 
      className={`bg-white rounded-xl p-4 my-2 ${shadowClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;