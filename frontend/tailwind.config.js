/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0b0f',
          secondary: '#12141a',
          card: '#1a1d25',
        },
        accent: {
          primary: '#8b5cf6',
          secondary: '#06b6d4',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
        },
        border: '#2a2d35',
        success: '#22c55e',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

