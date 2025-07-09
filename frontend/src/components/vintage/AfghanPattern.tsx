import React from 'react';

interface AfghanPatternProps {
  type?: 'kilim' | 'mountains' | 'diamond' | 'wheat';
  color?: string;
  className?: string;
}

export const AfghanPattern: React.FC<AfghanPatternProps> = ({ 
  type = 'kilim', 
  color = '#8B0000',
  className = ''
}) => {
  const patterns = {
    kilim: (
      <pattern id="kilim-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="30" height="30" fill={color} opacity="0.1"/>
        <rect x="30" y="30" width="30" height="30" fill={color} opacity="0.1"/>
        <line x1="0" y1="30" x2="60" y2="30" stroke={color} strokeWidth="1" opacity="0.2"/>
        <line x1="30" y1="0" x2="30" y2="60" stroke={color} strokeWidth="1" opacity="0.2"/>
        <rect x="15" y="15" width="30" height="30" fill="none" stroke={color} strokeWidth="0.5" opacity="0.15"/>
      </pattern>
    ),
    mountains: (
      <pattern id="mountains-pattern" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
        <polyline points="0,50 25,20 50,35 75,15 100,50" 
                  fill="none" stroke={color} strokeWidth="1.5" opacity="0.15"/>
        <polyline points="0,50 15,35 35,40 60,25 85,30 100,50" 
                  fill="none" stroke={color} strokeWidth="1" opacity="0.1"/>
      </pattern>
    ),
    diamond: (
      <pattern id="diamond-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon points="40,10 70,40 40,70 10,40" fill="none" stroke={color} strokeWidth="1" opacity="0.2"/>
        <polygon points="40,20 60,40 40,60 20,40" fill={color} opacity="0.05"/>
        <polygon points="40,30 50,40 40,50 30,40" fill="none" stroke={color} strokeWidth="0.5" opacity="0.15"/>
      </pattern>
    ),
    wheat: (
      <pattern id="wheat-pattern" x="0" y="0" width="40" height="80" patternUnits="userSpaceOnUse">
        <g opacity="0.2">
          <path d="M20,10 Q20,30 15,40 M20,10 Q20,30 25,40 M20,10 L20,40" 
                stroke={color} strokeWidth="1" fill="none"/>
          <circle cx="20" cy="10" r="3" fill={color} opacity="0.6"/>
          <circle cx="15" cy="15" r="2" fill={color} opacity="0.4"/>
          <circle cx="25" cy="15" r="2" fill={color} opacity="0.4"/>
          <circle cx="12" cy="20" r="1.5" fill={color} opacity="0.3"/>
          <circle cx="28" cy="20" r="1.5" fill={color} opacity="0.3"/>
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