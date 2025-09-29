/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors that work in both themes
        'cloud-white': {
          DEFAULT: '#FFFFFF',
          dark: '#FFFFFF',
        },
        'space-950': {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A',
        },
        'space-900': {
          DEFAULT: '#F1F5F9',
          dark: '#1E293B',
        },
        'space-800': {
          DEFAULT: '#E2E8F0',
          dark: '#334155',
        },
        'space-700': {
          DEFAULT: '#CBD5E1',
          dark: '#475569',
        },
        'system-grey': {
          DEFAULT: '#64748B',
          dark: '#64748B',
        },
        'electric-500': '#3B82F6',
        'electric-600': '#2563EB',
        'danger-red': '#EF4444',
        'alert-orange': '#F97316',
        'warning-yellow': '#EAB308',
        'success-green': '#22C55E',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
