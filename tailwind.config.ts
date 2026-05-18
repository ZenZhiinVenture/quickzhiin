import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enables dark mode using "class" strategy
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        darkBlueElements: 'var(--dark-blue-elements)',
        veryDarkBlueBg: 'var(--very-dark-blue-bg)',
        veryDarkBlueText: 'var(--very-dark-blue-text)',
        darkGrayInput: 'var(--dark-gray-input)',
        veryLightGrayBg: 'var(--very-light-gray-bg)',
        whiteText: 'var(--white-text)',
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        primary: 'rgb(var(--primary))',
        secondary: 'rgb(var(--secondary))',
        success: 'rgb(var(--success))',
        error: 'rgb(var(--error))',
        popover: {
          DEFAULT: 'rgb(var(--popover))',
          foreground: 'rgb(var(--popover-foreground))',
        },
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
      fontSize: {
        body: '14px',
        detail: '16px',
      },
      fontWeight: {
        light: '300',
        semibold: '600',
        bold: '800',
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
      rounded: {
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
      spacing: {
        page: 'px-4 py-6 sm:px-6 lg:px-8',
        section: 'px-4 py-5 sm:px-6',
        card: 'p-4 sm:p-6',
      },
      shadows: {
        sm: 'shadow-sm',
        md: 'shadow',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
      container: {
        center: 'true',
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
