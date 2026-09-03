/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/client/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0F172A',       // Slate 900
          card: '#1E293B',     // Slate 800
          border: '#334155',   // Slate 700
          muted: '#475569',    // Slate 600
          text: '#F8FAFC',     // Slate 50
          subtext: '#94A3B8',  // Slate 400
        },
        accent: {
          hammer: '#F59E0B',   // Amber 500 — Робота/Молотки
          bed: '#3B82F6',      // Blue 500 — Відпочинок/Ліжечко
          drive: '#22C55E',    // Green 500 — Їзда
          stop: '#EF4444',     // Red 500 — Стоп
          toll: '#A855F7',     // Purple 500 — Дороги/Паркінг
          border: '#F59E0B',   // Amber — Кордон
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
