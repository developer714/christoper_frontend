// src/components/ui/Button.tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onClick?: () => void; // Make onClick optional
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primaryDark',
    secondary: 'bg-secondary text-white hover:bg-secondaryDark',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primaryLight hover:bg-opacity-10',
    ghost: 'bg-transparent text-primary hover:bg-primaryLight hover:bg-opacity-10',
    danger: 'bg-error text-white hover:bg-red-600',
  };

  // Size styles
  const sizeStyles = {
    small: 'py-2 px-3 text-sm',
    medium: 'py-3 px-4 text-base',
    large: 'py-4 px-5 text-lg',
  };

  // Disabled styles
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Base styles
  const baseStyles = 'rounded-lg font-semibold inline-flex items-center justify-center transition-colors duration-200';

  // Combine styles
  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled ? disabledStyles : ''}
    ${widthStyle}
    ${className}
  `;

  const renderContent = () => {
    if (loading) {
      return (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }

    if (!icon) {
      return title;
    }

    return (
      <>
        {iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {title}
        {iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </>
    );
  };

  // Handle click event or pass undefined if no handler provided
  const handleClick = onClick || undefined;

  return (
    <button
      className={buttonStyles}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
    >
      {renderContent()}
    </button>
  );
};

export default Button;