/** @type {import('tailwindcss').Config} */
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    // Skala tipografi: 12 / 14 / 16 / 20 / 24 / 32 / 48
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
      '2xl': ['32px', '40px'],
      '3xl': ['48px', '1.1'],
    },
    extend: {
      colors: {
        navy: { 900: '#0B1E3A', 700: '#142B52' },
        brand: {
          100: '#E6F0FF',
          400: '#4A8DFF',
          500: '#1E6FF2',
          600: '#1859CC',
          700: '#1449A6',
        },
        danger: { DEFAULT: '#E5484D', 300: '#FF8A8E', 600: '#D13438', 700: '#B52A2E' },
        success: { DEFAULT: '#22A06B' },
        warning: { DEFAULT: '#E5A100' },
        // Token semantik (berubah otomatis di mode gelap) — lihat styles/tokens.css
        app: withAlpha('--rt-app'),
        surface: withAlpha('--rt-surface'),
        ink: withAlpha('--rt-ink'),
        muted: withAlpha('--rt-muted'),
        line: withAlpha('--rt-line'),
        brandsoft: withAlpha('--rt-soft'),
      },
      borderColor: { DEFAULT: withAlpha('--rt-line') },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: { xl: '12px' },
      boxShadow: {
        card: '0 8px 30px rgba(11, 30, 58, 0.10)',
        panel: '-8px 0 30px rgba(11, 30, 58, 0.18)',
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(24px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(0.5)', opacity: '0' }, '60%': { transform: 'scale(1.15)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
      },
      animation: {
        'slide-in': 'slide-in 0.22s ease-out',
        'fade-in': 'fade-in 0.18s ease-out',
        pop: 'pop 0.35s ease-out',
        'pulse-soft': 'pulse-soft 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
