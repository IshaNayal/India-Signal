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
          primary: '#0A0C10',
          surface: '#111318',
          elevated: '#1E2028',
        },
        border: '#1E2028',
        accent: {
          teal: '#00FFB3',
          danger: '#FF4444',
          warning: '#FF8C00',
          diplomacy: '#378ADD',
        },
        text: {
          primary: '#E2E8F0',
          muted: '#64748B',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00FFB3, 0 0 10px #00FFB3' },
          '100%': { boxShadow: '0 0 10px #00FFB3, 0 0 20px #00FFB3' },
        },
      },
    },
  },
  plugins: [],
}
