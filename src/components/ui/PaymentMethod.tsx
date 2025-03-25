// src/components/ui/PaymentMethodCard.tsx
import React from 'react';
import { CreditCard, CheckCircle2, Trash } from 'lucide-react';
import Card from './Card';

interface PaymentMethod {
  _id: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onSetDefault?: () => void;
  onDelete?: () => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onSetDefault,
  onDelete
}) => {
  const getBrandLogo = (brand: string) => {
    // In a real app, you'd use proper card brand logos
    switch (brand.toLowerCase()) {
      case 'visa':
        return <CreditCard size={24} className="text-blue-700" />;
      case 'mastercard':
        return <CreditCard size={24} className="text-red-500" />;
      case 'amex':
        return <CreditCard size={24} className="text-blue-500" />;
      default:
        return <CreditCard size={24} className="text-gray-500" />;
    }
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            {getBrandLogo(paymentMethod.brand)}
            <div className="ml-3">
              <div className="font-medium text-text">
                {paymentMethod.brand} •••• {paymentMethod.last4}
              </div>
            </div>
          </div>
          
          {paymentMethod.isDefault && (
            <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs font-medium rounded-full">
              Default
            </span>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          {!paymentMethod.isDefault && onSetDefault && (
            <button 
              onClick={onSetDefault}
              className="flex items-center text-sm text-primary hover:underline"
            >
              <CheckCircle2 size={16} className="mr-1" /> 
              Set as Default
            </button>
          )}
          
          {onDelete && (
            <button 
              onClick={onDelete}
              className="flex items-center text-sm text-error hover:underline"
            >
              <Trash size={16} className="mr-1" /> 
              Remove
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PaymentMethodCard;