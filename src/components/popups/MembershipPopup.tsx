import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface MembershipPopupProps {
  isOpen: boolean;
  onClose: () => void;
  frequency: 'weekly' | 'biweekly' | 'twice-weekly';
}

const MembershipPopup: React.FC<MembershipPopupProps> = ({ isOpen, onClose, frequency }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const planTitle = frequency === 'weekly' 
    ? 'Weekly Plan' 
    : frequency === 'biweekly' 
      ? 'Biweekly Plan' 
      : 'Twice Weekly Plan';

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xs rounded-3xl overflow-hidden transform transition-transform duration-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-500 py-3 px-4 text-white text-center font-medium text-lg">
          <div className="flex items-center justify-center">
            <Sparkles size={24} className="mr-2 text-white" />
            {planTitle}
          </div>
        </div>

        {/* Blue Placeholder Area */}
        <div className="bg-blue-50 py-8 flex justify-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-center text-gray-800 text-sm font-medium mb-3">
            Upgrade to our Premium Membership for additional benefits with your recurring cleaning plan!
          </h3>

          <div className="space-y-2 mb-4 text-xs">
            <div className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span className="text-gray-700">40% off your first clean</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span className="text-gray-700">25% off all subsequent cleans</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span className="text-gray-700">Priority booking for your preferred dates and times</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span className="text-gray-700">Dedicated customer support for a seamless experience</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span className="text-gray-700">Free rescheduling* up to 2 hours before clean</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span className="text-gray-700">Additional discounts on event cleaning services</span>
            </div>
          </div>

          {/* Price section */}
          <div className="bg-blue-50 rounded-lg p-3 text-center mb-4">
            <h4 className="text-gray-700 text-sm font-medium">Premium Membership</h4>
            <div className="text-blue-500 text-xl font-bold">$19.99/month</div>
            <div className="text-gray-500 text-xs">Cancel anytime</div>
          </div>

          {/* Action button */}
          {frequency !== 'weekly' && (
            <button 
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors text-sm"
              onClick={onClose}
            >
              Add Premium Membership
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipPopup;