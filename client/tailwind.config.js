/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shield: {
          darkest: '#080E1E',
          navy: '#0B132B',
          dark: '#1C2541',
          surface: '#151D33',
          card: '#1F2C4C',
          border: '#2A3C66',
          blue: '#3A506B',
          teal: '#00B4D8',
          cyan: '#90E0EF',
          emerald: '#06D6A0',
          amber: '#FFD166',
          rose: '#EF476F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
