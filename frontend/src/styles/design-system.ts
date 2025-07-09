// Geometric Design System for Kalaagh Platform
// Inspired by vintage newspaper aesthetics with Afghan geometric patterns

// Color Palette
export const colors = {
  primary: {
    saffron: '#FFA500',      // Main brand color - Afghan saffron
    saffronLight: '#FFD700',
    saffronDark: '#FF8C00',
  },
  secondary: {
    turquoise: '#40E0D0',    // Afghan turquoise
    turquoiseLight: '#48F4E3',
    turquoiseDark: '#00CED1',
  },
  neutral: {
    cream: '#FFF8DC',        // Paper-like background
    parchment: '#FAF0E6',
    ink: '#1A1A1A',          // Deep black for text
    charcoal: '#333333',
    stone: '#686868',
    sand: '#F5F5DC',
  },
  accent: {
    ruby: '#DC143C',         // For alerts/errors
    emerald: '#50C878',      // For success
    amber: '#FFBF00',        // For warnings
    lapis: '#26619C',        // For info
  },
  geometric: {
    pattern1: '#8B4513',     // Saddle brown for patterns
    pattern2: '#CD853F',     // Peru for geometric designs
    pattern3: '#DEB887',     // Burlywood for subtle patterns
  }
};

// Typography
export const typography = {
  fontFamilies: {
    serif: '"Amiri", "Georgia", serif',              // For headings (supports Arabic)
    sans: '"IBM Plex Sans", "Helvetica", sans-serif', // For body text
    arabic: '"Noto Naskh Arabic", "Amiri", serif',   // For Dari/Pashto
    mono: '"IBM Plex Mono", monospace',              // For code
  },
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Spacing System (8px base)
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.25rem',    // 4px
  lg: '0.5rem',     // 8px
  xl: '1rem',       // 16px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  'newspaper': '2px 2px 4px rgba(0, 0, 0, 0.3)', // Vintage print effect
};

// Geometric Patterns
export const patterns = {
  // SVG patterns for background decorations
  afghanStar: `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="currentColor" stroke-width="1">
      <path d="M20 5 L25 15 L35 15 L27 22 L30 32 L20 26 L10 32 L13 22 L5 15 L15 15 Z"/>
    </g>
  </svg>`,
  
  islamicTile: `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="currentColor" stroke-width="1">
      <path d="M30 10 L40 20 L40 40 L30 50 L20 40 L20 20 Z"/>
      <path d="M10 30 L20 20 L40 20 L50 30 L40 40 L20 40 Z"/>
    </g>
  </svg>`,
  
  border: `<svg width="100" height="20" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
    <pattern id="border-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="10" height="10" fill="currentColor" opacity="0.1"/>
      <rect x="10" y="10" width="10" height="10" fill="currentColor" opacity="0.1"/>
    </pattern>
    <rect width="100" height="20" fill="url(#border-pattern)"/>
  </svg>`,
};

// Animation Durations
export const animations = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easings: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
};

// Utility Functions
export const utils = {
  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  
  // Generate geometric pattern background
  patternBackground: (pattern: string, color: string = colors.geometric.pattern3): string => {
    const encoded = encodeURIComponent(pattern.replace('currentColor', color));
    return `url("data:image/svg+xml,${encoded}")`;
  },
  
  // RTL Support helper
  rtlProperty: (property: string, value: string, rtl: boolean = false): object => {
    if (rtl) {
      if (property.includes('left')) {
        return { [property.replace('left', 'right')]: value };
      }
      if (property.includes('right')) {
        return { [property.replace('right', 'left')]: value };
      }
    }
    return { [property]: value };
  },
};

// Export complete theme
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  patterns,
  animations,
  breakpoints,
  zIndex,
  utils,
};

export default theme;