/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#a0a0a0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#202020',
          900: '#101010',
        },
        synthwave: {
          bg: '#0a0e27',
          'bg-light': '#16213e',
          'bg-lighter': '#1f2937',
          pink: '#ff006e',
          purple: '#8338ec',
          cyan: '#3a86ff',
          neon: '#ffbe0b',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
