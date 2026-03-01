/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
        display: ['Orbitron', 'JetBrains Mono', 'monospace'],
      },
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
          DEFAULT: '#080e1a',
          card: '#0c1220',
          hover: '#131b2e',
          raised: '#1a2440',
        },
        severity: {
          low: '#22c55e',
          med: '#f59e0b',
          high: '#ef4444',
          crit: '#dc2626',
        },
        amber: {
          DEFAULT: '#f0a030',
          dim: '#8b6914',
          glow: 'rgba(240,160,48,0.15)',
          dark: '#3d2800',
        },
        tactical: {
          green: '#39ff14',
          red: '#ff3333',
          blue: '#00bfff',
          cyan: '#00ffff',
        },
      },
      boxShadow: {
        'hud': 'inset 0 0 30px rgba(240,160,48,0.03), 0 0 15px rgba(240,160,48,0.05)',
        'amber-glow': '0 0 20px rgba(240,160,48,0.15)',
        'crt': '0 0 40px rgba(240,160,48,0.08)',
      },
    },
  },
  plugins: [],
};
