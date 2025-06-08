// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'light-blue': '#E3F2FD',
        'dusty-pink': '#FCE4EC',
        'gold': '#FFF8E1',
        'deep-olive': '#33691E',
        'bronzed-orange': '#FF8F00',
        'shield-blue': '#1565C0',
        
        // Neutral colors
        'cream': '#FAF9F7',
        'light-grey': '#F5F5F5',
        'light-medium-grey': '#E0E0E0',
        'medium-grey': '#9E9E9E',
        'charcoal-grey': '#424242',
        
        // Status colors
        'success-green': '#4CAF50',
        'warning-yellow': '#FF9800',
        'error-red': '#F44336',
        'info-blue': '#2196F3',
        
        // Financial colors
        'money-green': '#43A047',
        'debt-red': '#E53935',
        'neutral-slate': '#607D8B',
        
        // Block-specific colors
        'asset-blue': {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
        'credit-pink': {
          50: '#FCE4EC',
          100: '#F8BBD9',
          200: '#F48FB1',
          300: '#F06292',
          400: '#EC407A',
          500: '#E91E63',
          600: '#D81B60',
          700: '#C2185B',
          800: '#AD1457',
          900: '#880E4F',
        },
        'user-gold': {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFC107',
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#FF6F00',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        'h3': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'h4': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'h5': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'h6': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'subtitle': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'overline': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.1em' }],
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'block': '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        'block-hover': '0 4px 20px 0 rgba(0, 0, 0, 0.15)',
        'modal': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'block': '12px',
        'card': '8px',
        'button': '6px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        'canvas': 'calc(100vh - 120px)',
      },
      maxWidth: {
        'canvas': '1920px',
      },
      zIndex: {
        'modal': '1000',
        'dropdown': '100',
        'tooltip': '200',
        'notification': '300',
      }
    },
  },
  plugins: [
    // Add any additional Tailwind plugins here
    function({ addUtilities }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.glass': {
          'backdrop-filter': 'blur(10px)',
          'background-color': 'rgba(255, 255, 255, 0.8)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(10px)',
          'background-color': 'rgba(0, 0, 0, 0.1)',
          'border': '1px solid rgba(0, 0, 0, 0.1)',
        }
      }
      addUtilities(newUtilities)
    }
  ],
}