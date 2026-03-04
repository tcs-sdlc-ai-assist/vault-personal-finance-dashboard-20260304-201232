import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/layout/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          DEFAULT: '#3B82F6', // blue-500
          light: '#60A5FA',   // blue-400
          dark: '#1E40AF',    // blue-800
          accent: '#F472B6',  // pink-400
        },
        // Neutral palette
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E5E7EB',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Success, warning, error, info
        success: {
          DEFAULT: '#22C55E', // green-500
          light: '#4ADE80',   // green-400
          dark: '#15803D',    // green-800
        },
        warning: {
          DEFAULT: '#FACC15', // yellow-400
          light: '#FDE68A',   // yellow-200
          dark: '#B45309',    // yellow-800
        },
        error: {
          DEFAULT: '#EF4444', // red-500
          light: '#F87171',   // red-400
          dark: '#991B1B',    // red-800
        },
        info: {
          DEFAULT: '#38BDF8', // sky-400
          light: '#7DD3FC',   // sky-300
          dark: '#0369A1',    // sky-800
        },
        // Category colors (for budgets, transactions, etc.)
        category: {
          groceries: '#F59E42',
          bills: '#A78BFA',
          entertainment: '#F472B6',
          travel: '#38BDF8',
          health: '#22C55E',
          savings: '#FACC15',
          other: '#64748B',
        },
        // Gradients
        gradient: {
          bluePink: 'linear-gradient(90deg, #3B82F6 0%, #F472B6 100%)',
          greenYellow: 'linear-gradient(90deg, #22C55E 0%, #FACC15 100%)',
          purpleOrange: 'linear-gradient(90deg, #A78BFA 0%, #F59E42 100%)',
        },
        // Overlay and glassmorphism
        overlay: 'rgba(16, 24, 40, 0.6)',
        glass: 'rgba(255,255,255,0.7)',
      },
      fontFamily: {
        // Custom font families
        sans: [
          'Inter',
          'ui-sans-serif',
          ...fontFamily.sans,
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          ...fontFamily.mono,
        ],
        heading: [
          'Montserrat',
          'ui-sans-serif',
          ...fontFamily.sans,
        ],
      },
      boxShadow: {
        // Custom shadows for cards, modals, etc.
        'sm': '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        'md': '0 4px 8px 0 rgba(16, 24, 40, 0.10)',
        'lg': '0 8px 24px 0 rgba(16, 24, 40, 0.15)',
        'xl': '0 16px 32px 0 rgba(16, 24, 40, 0.18)',
        'glass': '0 4px 32px 0 rgba(16, 24, 40, 0.12)',
        'focus': '0 0 0 2px #3B82F6',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
        'full': '9999px',
      },
      screens: {
        // Custom breakpoints for responsive design
        xs: '420px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      // Animations for dashboard and UI
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-24px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        fadeOut: 'fadeOut 0.3s ease-in',
        slideUp: 'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)',
        slideDown: 'slideDown 0.4s cubic-bezier(0.4,0,0.2,1)',
        pulse: 'pulse 1.5s infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
      },
      // Custom z-index for overlays, modals, tooltips
      zIndex: {
        base: '1',
        dropdown: '10',
        modal: '20',
        toast: '30',
        tooltip: '40',
      },
      // Custom spacing for layout
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      // Custom opacity for glassmorphism
      opacity: {
        15: '0.15',
        30: '0.3',
        60: '0.6',
        85: '0.85',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
};

export default config;