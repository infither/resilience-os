/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0D1B2A',
        primary: '#1E3A8A',
        highlight: '#3B82F6',
        indigo: '#5D5FEF',
        indigosoft: '#EEF0FF',
        muted: '#6B7280',
        border: '#EDF0F5',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        ink: '#0D1B2A',
        body: '#374151',
        canvas: '#F5F6FA',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '1240px',
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(20, 30, 60, 0.06)',
        cardhover: '0 10px 30px -6px rgba(20, 30, 60, 0.12)',
        pill: '0 8px 18px -6px rgba(93, 95, 239, 0.5)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInFast: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out both',
        fadeInFast: 'fadeInFast 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
