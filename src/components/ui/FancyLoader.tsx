// src/components/ui/FancyLoader.tsx

import React from 'react';

interface FancyLoaderProps {
  visible: boolean;
  message?: string;
}

const FancyLoader: React.FC<FancyLoaderProps> = ({ visible, message = 'Loading...' }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
      <div className="relative w-24 h-24">
        {/* Outer spinning circle */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-300 animate-spin"></div>
        
        {/* Middle spinning circle - opposite direction */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-400 border-l-blue-200 animate-spin-slow"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-5 rounded-full bg-blue-500 animate-pulse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-9 rounded-full bg-white"></div>
      </div>
      
      {/* Loading message */}
      <div className="mt-6 text-blue-600 font-medium">{message}</div>
      
      {/* Bouncing dots */}
      <div className="flex space-x-2 mt-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-delay-1"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-delay-2"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-delay-3"></div>
      </div>
    </div>
  );
};

export default FancyLoader;