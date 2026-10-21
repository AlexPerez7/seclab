/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f0e',
        panel: '#111816',
        edge: '#1f2b28',
        muted: '#7d8f8a',
        acento: '#2ee88a',
        warn: '#f5b941',
        bad: '#f2545b',
        info: '#5ab4f5',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
