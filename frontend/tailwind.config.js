/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#152033',
          900: '#0f172a',
          950: '#090d16',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#0a0f1d'
        },
        watershed: {
          teal: '#0ea5e9',
          emerald: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          accent: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
