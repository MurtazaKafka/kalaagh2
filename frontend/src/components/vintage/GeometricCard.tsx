import React from 'react';
import type { ReactNode } from 'react';
import { AfghanPattern } from './AfghanPattern';

interface GeometricCardProps {
  children: ReactNode;
  pattern?: 'default' | 'angled' | 'hexagon' | 'octagon' | 'trapezoid' | 'parallelogram';
  patternType?: 'kilim' | 'mountains' | 'diamond' | 'wheat';
  className?: string;
}

export const GeometricCard: React.FC<GeometricCardProps> = ({ 
  children, 
  pattern = 'default',
  patternType = 'kilim',
  className = ''
}) => {
  const shapes = {
    default: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
    angled: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    octagon: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    trapezoid: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
    parallelogram: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'
  };
  
  return (
    <div className={`article-card ${className}`}>
      <AfghanPattern type={patternType} />
      
      <div 
        className="relative z-10"
        style={{ clipPath: pattern !== 'default' ? shapes[pattern] : undefined }}
      >
        {children}
      </div>
      
      {/* Corner brackets for newspaper style */}
      <span aria-hidden="true"></span>
    </div>
  );
};