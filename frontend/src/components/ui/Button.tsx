import React from 'react';
import { theme } from '../../styles/design-system';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    border-2 overflow-hidden
  `;

  const sizeStyles = {
    sm: `px-3 py-1.5 text-sm rounded-md`,
    md: `px-4 py-2 text-base rounded-lg`,
    lg: `px-6 py-3 text-lg rounded-xl`,
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-orange-500 to-amber-500
      text-white border-transparent
      hover:from-orange-600 hover:to-amber-600
      focus:ring-orange-500
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-gradient-to-r from-cyan-500 to-teal-500
      text-white border-transparent
      hover:from-cyan-600 hover:to-teal-600
      focus:ring-cyan-500
      shadow-md hover:shadow-lg
    `,
    outline: `
      bg-transparent border-orange-500 text-orange-600
      hover:bg-orange-50 hover:border-orange-600
      focus:ring-orange-500
    `,
    ghost: `
      bg-transparent border-transparent text-gray-700
      hover:bg-gray-100 hover:text-gray-900
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500
      text-white border-transparent
      hover:from-red-600 hover:to-pink-600
      focus:ring-red-500
      shadow-md hover:shadow-lg
    `,
  };

  const geometricDecoration = variant !== 'ghost' && variant !== 'outline' ? (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <div 
        className="absolute top-0 right-0 w-8 h-8 transform rotate-45 translate-x-4 -translate-y-4"
        style={{ backgroundColor: theme.colors.neutral.cream }}
      />
      <div 
        className="absolute bottom-0 left-0 w-8 h-8 transform rotate-45 -translate-x-4 translate-y-4"
        style={{ backgroundColor: theme.colors.neutral.cream }}
      />
    </div>
  ) : null;

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {geometricDecoration}
      
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      
      <span className="relative z-10">{children}</span>
      
      {icon && iconPosition === 'right' && !loading ? (
        <span className="ml-2">{icon}</span>
      ) : null}
    </button>
  );
};