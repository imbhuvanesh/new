/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b1613',
        'ink-soft': '#3c322a',
        paper: '#f4ecdd',
        'paper-deep': '#e4d7bf',
        'paper-shadow': '#c9b795',
        leather: '#180f0c',
        'leather-hi': '#2a1a14',
        bronze: '#b08d57',
        'bronze-bright': '#e0be83',
        'bronze-dim': '#7d6238',
        burgundy: '#6d2233',
        charcoal: '#0a0908',
        void: '#050404',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
      letterSpacing: {
        widest2: '0.34em',
      },
    },
  },
  plugins: [],
}
