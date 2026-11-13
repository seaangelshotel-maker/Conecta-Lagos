import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import aspectRatio from '@tailwindcss/aspect-ratio'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './{components,pages,services,data,hooks,utils,contexts,lib}/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
          500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49',
        },
        gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [forms, typography, aspectRatio],
}
