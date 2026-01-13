/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nifty-bg': '#0F1014',
        'nifty-card': '#16171D',
        'nifty-hover': '#262933',
        'nifty-border': '#363a47',
        'nifty-green': '#4fffbc',
        'nifty-yellow': '#ffe500',
        'nifty-purple': '#cf68fb',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #4fffbc' },
          '100%': { boxShadow: '0 0 20px #4fffbc, 0 0 10px #4fffbc' },
        }
      }
    },
  },
  plugins: [],
};