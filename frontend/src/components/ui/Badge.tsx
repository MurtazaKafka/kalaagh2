import React from 'react';
import { theme } from '../../styles/design-system';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  dot = false,
  children,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const variantStyles = {
    primary: 'bg-orange-100 text-orange-800 border-orange-200',
    secondary: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const dotColors = {
    primary: theme.colors.primary.saffron,
    secondary: theme.colors.secondary.turquoise,
    success: theme.colors.accent.emerald,
    warning: theme.colors.accent.amber,
    danger: theme.colors.accent.ruby,
    info: theme.colors.accent.lapis,
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        border ${sizeStyles[size]} ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className="w-2 h-2 rounded-full mr-1.5"
          style={{ backgroundColor: dotColors[variant] }}
        />
      )}
      {children}
    </span>
  );
};

interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className = '',
}) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {children}
  </div>
);