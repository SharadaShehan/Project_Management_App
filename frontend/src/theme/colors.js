// Modern Color Palette for Project Management App
export const colors = {
  // Primary Colors
  primary: {
    main: '#2563EB',      // Modern blue
    light: '#60A5FA',     // Light blue
    dark: '#1E40AF',      // Dark blue
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#2563EB',
    600: '#1D4ED8',
    700: '#1E40AF',
  },
  
  // Secondary Colors
  secondary: {
    main: '#10B981',      // Modern green
    light: '#34D399',     // Light green
    dark: '#059669',      // Dark green
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  
  // Accent Colors
  accent: {
    purple: '#8B5CF6',
    orange: '#F59E0B',
    pink: '#EC4899',
    teal: '#14B8A6',
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    black: '#000000',
  },
  
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: '#1F2937',
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#2563EB',
  },
  
  // Border Colors
  border: {
    light: '#E5E7EB',
    main: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    main: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
};

// Legacy color mapping for gradual migration
export const legacyColors = {
  green: colors.secondary.main,
  blue: colors.primary.main,
  red: colors.status.error,
};

export default colors;
