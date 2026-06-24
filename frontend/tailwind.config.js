/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0D0D0D',
        paper: '#F7F6F3',
        mist: '#E8E6E1',
        slate: '#6B7280',
        accent: '#2563EB',
        'accent-dim': '#DBEAFE',
        success: '#059669',
        warn: '#D97706',
      }
    },
  },
  plugins: [],
}
