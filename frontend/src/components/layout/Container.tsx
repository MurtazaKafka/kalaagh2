import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'lg',
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  pattern?: boolean;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  pattern = false,
  id,
}) => {
  return (
    <section id={id} className={`relative py-12 md:py-16 ${className}`}>
      {pattern && (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 border-2 border-orange-300 rounded-full" />
          <div className="absolute bottom-0 right-0 w-48 h-48 border-2 border-cyan-300 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-amber-300 rotate-45" />
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};