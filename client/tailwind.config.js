/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          dark: '#3E2723',
          darker: '#1A0F0A',
          darkest: '#0F0805',
          brown: '#5D4037',
          brownLight: '#6D5047',
          medium: '#8D6E63',
          mediumLight: '#A68B7F',
          light: '#BCAAA4',
          cream: '#EFEBE9',
          creamLight: '#F5F3F1',
          amber: '#FF6F00',
          amberLight: '#FF8F33',
          amberDark: '#E65100',
          gold: '#FFB300',
          goldLight: '#FFC233',
          goldDark: '#E68900',
          bronze: '#CD7F32',
          copper: '#B87333',
          caramel: '#D2691E',
          espresso: '#2C1810',
        }
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-3px)' },
          '40%': { transform: 'translateX(3px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        gradient: 'gradient 14s ease infinite',
        float: 'float 6s ease-in-out infinite',
        fadeIn: 'fadeIn 600ms ease-out both',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        shake: 'shake 400ms ease',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        heading: ['Geom', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

