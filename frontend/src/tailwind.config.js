/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // use HEX instead of oklch
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
