/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'general-sans': ['General Sans', 'system-ui', 'sans-serif'],
        'satoshi': ['Satoshi', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        campus: {
          dark: '#1a1a2e',
          mid: '#16213e',
          light: '#0f3460',
          accent: '#e94560',
        },
        nm: {
          'bg-light': '#e0e5ec',
          'shadow-light': '#a3b1c6',
          'highlight-light': '#ffffff',
          'bg-dark': '#1e2030',
          'shadow-dark': '#14152a',
          'highlight-dark': '#2a2d42',
        },
      },
      boxShadow: {
        'nm-flat': '6px 6px 12px var(--nm-shadow), -6px -6px 12px var(--nm-highlight)',
        'nm-flat-lg': '8px 8px 16px var(--nm-shadow), -8px -8px 16px var(--nm-highlight)',
        'nm-inset': 'inset 4px 4px 8px var(--nm-shadow), inset -4px -4px 8px var(--nm-highlight)',
        'nm-btn': '4px 4px 8px var(--nm-shadow), -4px -4px 8px var(--nm-highlight)',
        'nm-btn-active': 'inset 2px 2px 4px var(--nm-shadow), inset -2px -2px 4px var(--nm-highlight)',
      },
      borderRadius: {
        'nm': '16px',
        'nm-sm': '12px',
      },
      animation: {
        'float-bob': 'floatBob 3s ease-in-out infinite',
        'wave-shimmer': 'waveShimmer 1.5s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        'slide-in': 'slideIn 0.3s ease forwards',
      },
      keyframes: {
        floatBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        waveShimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 12px currentColor)' },
        },
        cursorBlink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(-10px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}