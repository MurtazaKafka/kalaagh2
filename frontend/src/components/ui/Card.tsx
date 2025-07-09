import React from 'react';
import { theme } from '../../styles/design-system';

interface CardProps {
  variant?: 'flat' | 'raised' | 'outlined' | 'geometric';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'raised',
  padding = 'md',
  className = '',
  children,
  onClick,
  hoverable = false,
}) => {
  const baseStyles = `
    relative rounded-lg transition-all duration-300
    ${onClick || hoverable ? 'cursor-pointer' : ''}
  `;

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    flat: `
      bg-white
    `,
    raised: `
      bg-white shadow-lg
      ${hoverable ? 'hover:shadow-xl hover:-translate-y-1' : ''}
    `,
    outlined: `
      bg-transparent border-2 border-gray-200
      ${hoverable ? 'hover:border-orange-400' : ''}
    `,
    geometric: `
      bg-gradient-to-br from-amber-50 to-orange-50
      shadow-lg border-2 border-orange-200
      ${hoverable ? 'hover:shadow-xl hover:border-orange-400' : ''}
    `,
  };

  const geometricCorners = variant === 'geometric' && (
    <>
      <div 
        className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-400 rounded-tl-lg"
        style={{ borderColor: theme.colors.primary.saffron }}
      />
      <div 
        className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-400 rounded-tr-lg"
        style={{ borderColor: theme.colors.primary.saffron }}
      />
      <div 
        className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-400 rounded-bl-lg"
        style={{ borderColor: theme.colors.primary.saffron }}
      />
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-400 rounded-br-lg"
        style={{ borderColor: theme.colors.primary.saffron }}
      />
    </>
  );

  return (
    <div
      className={`
        ${baseStyles}
        ${paddingStyles[padding]}
        ${variantStyles[variant]}
        ${className}
      `}
      onClick={onClick}
    >
      {geometricCorners}
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => (
  <div className={`flex justify-between items-start mb-4 ${className}`}>
    <div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  children,
}) => (
  <div className={`text-gray-700 ${className}`}>
    {children}
  </div>
);

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
  align = 'right',
}) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex ${alignStyles[align]} mt-6 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};