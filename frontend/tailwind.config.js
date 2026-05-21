/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support toggling dark mode via class
  theme: {
    extend: {
      colors: {
        // Notion/Linear Slate Palette
        slate: {
          950: '#090a0f',
          900: '#0f111a',
          800: '#1a1d2e',
          700: '#2d324a',
          600: '#474f75',
        },
        // Premium EdTech Gamification Colors
        duo: {
          green: '#58cc02',
          'green-light': '#61e002',
          'green-dark': '#46a302',
          orange: '#ff9600',
          'orange-light': '#ffb03a',
          blue: '#1cb0f6',
          purple: '#84d8ff',
          pink: '#ffc3d8',
          yellow: '#ffd900',
        },
        // Brand/Primary colors (Sleek Linear Violet)
        brand: {
          DEFAULT: '#5f3dc4',
          50: '#f3f0ff',
          100: '#e5dbff',
          200: '#d0bfff',
          300: '#b197fc',
          400: '#9775fa',
          500: '#845ef7',
          600: '#7048e8',
          700: '#5f3dc4',
          800: '#512da8',
          900: '#311b92',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        card: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
