/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        felt: {
          light: '#0f7a4f',
          DEFAULT: '#0b5d3b',
          dark: '#07472e',
          deep: '#052e1e',
        },
        gold: {
          light: '#f0d77a',
          DEFAULT: '#d4af37',
          dark: '#a8842a',
        },
        wood: {
          light: '#5a3a26',
          DEFAULT: '#3a2417',
          dark: '#241108',
        },
        cream: '#f5f0e1',
      },
      boxShadow: {
        table: '0 30px 60px -20px rgba(0,0,0,0.6)',
        gold: '0 8px 24px -8px rgba(212,175,55,0.5)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'sheet-in': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'sheet-in': 'sheet-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'pop-in': 'pop-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
