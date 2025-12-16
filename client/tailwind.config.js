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
          darker: '#2C1810',
          brown: '#5D4037',
          medium: '#8D6E63',
          light: '#BCAAA4',
          cream: '#EFEBE9',
          amber: '#FF6F00',
          gold: '#FFB300',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}

