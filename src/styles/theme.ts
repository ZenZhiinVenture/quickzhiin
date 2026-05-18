export const theme = {
  colors: {
    // Primary colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    // Background colors
    background: {
      primary: '#ffffff', // Main content background
      secondary: '#f8fafc', // Secondary/sidebar background
      tertiary: '#f1f5f9', // Card/container background
    },
    // Text colors
    text: {
      primary: '#1e293b', // Main text color
      secondary: '#64748b', // Secondary text
      muted: '#94a3b8', // Muted text
    },
    // Border colors
    border: {
      light: '#e2e8f0',
      default: '#cbd5e1',
      dark: '#94a3b8',
    },
    // Success/Error states
    success: {
      light: '#dcfce7',
      default: '#22c55e',
      dark: '#15803d',
    },
    error: {
      light: '#fee2e2',
      default: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      light: '#fef9c3',
      default: '#eab308',
      dark: '#a16207',
    },
    info: {
      light: '#dbeafe',
      default: '#3b82f6',
      dark: '#1d4ed8',
    },
  },
  // Spacing for consistency
  spacing: {
    page: 'px-4 py-6 sm:px-6 lg:px-8',
    section: 'px-4 py-5 sm:px-6',
    card: 'p-4 sm:p-6',
  },
  // Shadows for depth
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  },
  // Border radius
  rounded: {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  },
};
