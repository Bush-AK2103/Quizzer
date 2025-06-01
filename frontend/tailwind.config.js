/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f9f8',
          100: '#ccf3f1',
          200: '#99e7e3',
          300: '#66dbd5',
          400: '#33cfc7',
          500: '#00c3b9',
          600: '#00a9a5', // base
          700: '#00807d',
          800: '#005855',
          900: '#003f3d',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 