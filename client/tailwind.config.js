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
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        heading: ['Geom', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

