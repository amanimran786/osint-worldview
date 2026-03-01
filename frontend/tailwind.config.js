/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        surface: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
        },
        severity: {
          low: '#22c55e',
          med: '#f59e0b',
          high: '#ef4444',
          crit: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};
