// src/components/ui/Input.tsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  className?: string;
  containerClassName?: string;
  multiline?: boolean;
  rows?: number;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = '',
  containerClassName = '',
  type,
  multiline = false,
  rows = 4,
  textAlignVertical,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const containerClasses = `mb-4 w-full ${containerClassName}`;
  const inputContainerClasses = `flex items-center relative border rounded-lg ${error ? 'border-error' : 'border-border'} bg-white`;
  
  // Base classes for input
  const inputBaseClasses = `
    flex-1 h-12 text-base text-text outline-none bg-transparent
    ${leftIcon ? 'pl-10' : 'pl-3'}
    ${(rightIcon || type === 'password') ? 'pr-10' : 'pr-3'}
    ${className}
  `;
  
  // Additional classes for textarea
  const textareaClasses = `
    resize-none min-h-[100px] py-3 
    ${textAlignVertical === 'top' ? 'pt-3' : 'pt-3'}
  `;

  // Password visibility icon
  const passwordIcon = type === 'password' ? (
    <button 
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2"
      onClick={togglePasswordVisibility}
    >
      {isPasswordVisible ? (
        <EyeOff size={20} className="text-textLight" />
      ) : (
        <Eye size={20} className="text-textLight" />
      )}
    </button>
  ) : null;

  // Custom right icon
  const rightIconElement = rightIcon ? (
    <button 
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2"
      onClick={onRightIconClick}
      disabled={!onRightIconClick}
    >
      {rightIcon}
    </button>
  ) : null;
  
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-text mb-1.5">
          {label}
        </label>
      )}
      
      <div className={inputContainerClasses}>
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        
        {multiline ? (
          <textarea
            className={`${inputBaseClasses} ${textareaClasses}`}
            rows={rows}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            type={inputType}
            className={inputBaseClasses}
            {...rest}
          />
        )}
        
        {passwordIcon || rightIconElement}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
    </div>
  );
};

export default Input;