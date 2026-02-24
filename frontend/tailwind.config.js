/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#818CF8', // Indigo 400
          DEFAULT: '#4F46E5', // Indigo 600
          dark: '#4338CA', // Indigo 700
        },
        secondary: {
          DEFAULT: '#64748B', // Slate 500
        },
        accent: {
          DEFAULT: '#06B6D4', // Cyan 500
        },
        success: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
        },
        error: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
      }
    },
  },
  plugins: [],
}
