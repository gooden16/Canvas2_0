/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#00112E',
        'cream': '#F5F2E7',
        'charcoal-grey': '#333333',
        'medium-grey': '#999999',
        'light-medium-grey': '#CCCCCC',
        'light-grey': '#E5E5E5',
        'gold': '#D4AF37',
        'dusty-pink': '#F4C6D7',
        'light-blue': '#ADD8E6',
        'burgundy': '#A83440',
        'deep-olive': '#4C6652',
        'bronzed-orange': '#C27830',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'raleway': ['Raleway', 'sans-serif'], // Added for Brilliant* logo
      },
      fontSize: {
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h3': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
        'headline': ['1.5rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'subtitle': ['0.875rem', { lineHeight: '1.4' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'footnote': ['0.625rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'card': '0 2px 4px rgba(51, 51, 51, 0.1)',
        'elevated': '0 4px 8px rgba(51, 51, 51, 0.15)',
        'deep': '0 8px 16px rgba(51, 51, 51, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s ease-in-out infinite',
        'flow': 'flow 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'flow-dots': 'flowDots 3s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        flowDots: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      },
    },
  },
  plugins: [],
};