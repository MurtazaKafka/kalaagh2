import React from 'react';

interface MathematicalPatternProps {
  type?: 'fibonacci' | 'grid' | 'tessellation' | 'fractal' | 'golden-spiral';
  className?: string;
}

export const MathematicalPattern: React.FC<MathematicalPatternProps> = ({ 
  type = 'grid', 
  className = '' 
}) => {
  const patterns = {
    fibonacci: (
      <pattern id="fibonacci-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M50,50 Q50,30 30,30 Q30,50 50,50 Q70,50 70,30 Q50,30 50,50 Q50,70 70,70 Q70,50 50,50" 
              fill="none" stroke="#2C2C2C" strokeWidth="0.5" opacity="0.3"/>
        <rect x="30" y="30" width="20" height="20" fill="none" stroke="#2C2C2C" strokeWidth="0.3" opacity="0.2"/>
        <rect x="50" y="30" width="20" height="20" fill="none" stroke="#2C2C2C" strokeWidth="0.3" opacity="0.2"/>
        <rect x="30" y="50" width="40" height="20" fill="none" stroke="#2C2C2C" strokeWidth="0.3" opacity="0.2"/>
      </pattern>
    ),
    grid: (
      <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2C2C2C" strokeWidth="0.5" opacity="0.2"/>
        <circle cx="0" cy="0" r="1" fill="#2C2C2C" opacity="0.3"/>
        <circle cx="20" cy="0" r="1" fill="#2C2C2C" opacity="0.3"/>
        <circle cx="0" cy="20" r="1" fill="#2C2C2C" opacity="0.3"/>
        <circle cx="20" cy="20" r="1" fill="#2C2C2C" opacity="0.3"/>
      </pattern>
    ),
    tessellation: (
      <pattern id="tessellation-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <polygon points="30,0 60,30 30,60 0,30" fill="none" stroke="#2C2C2C" strokeWidth="0.5" opacity="0.2"/>
        <polygon points="30,15 45,30 30,45 15,30" fill="none" stroke="#2C2C2C" strokeWidth="0.3" opacity="0.15"/>
        <circle cx="30" cy="30" r="5" fill="none" stroke="#2C2C2C" strokeWidth="0.3" opacity="0.2"/>
      </pattern>
    ),
    fractal: (
      <pattern id="fractal-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <g opacity="0.2">
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="#2C2C2C" strokeWidth="0.5"/>
          <rect x="12.5" y="12.5" width="25" height="25" fill="none" stroke="#2C2C2C" strokeWidth="0.4"/>
          <rect x="62.5" y="12.5" width="25" height="25" fill="none" stroke="#2C2C2C" strokeWidth="0.4"/>
          <rect x="12.5" y="62.5" width="25" height="25" fill="none" stroke="#2C2C2C" strokeWidth="0.4"/>
          <rect x="62.5" y="62.5" width="25" height="25" fill="none" stroke="#2C2C2C" strokeWidth="0.4"/>
        </g>
      </pattern>
    ),
    'golden-spiral': (
      <pattern id="golden-spiral-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <g opacity="0.2">
          <path d="M50,50 Q75,50 75,25 Q50,25 50,50 Q50,75 25,75 Q25,50 50,50" 
                fill="none" stroke="#2C2C2C" strokeWidth="0.5"/>
          <rect x="50" y="25" width="25" height="25" fill="none" stroke="#2C2C2C" strokeWidth="0.3"/>
          <rect x="25" y="50" width="25" height="25" fill="none" stroke="#2C2C2C" strokeWidth="0.3"/>
          <rect x="50" y="50" width="12.5" height="12.5" fill="none" stroke="#2C2C2C" strokeWidth="0.3"/>
        </g>
      </pattern>
    )
  };

  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}>
      <defs>{patterns[type]}</defs>
      <rect width="100%" height="100%" fill={`url(#${type}-pattern)`} />
    </svg>
  );
};