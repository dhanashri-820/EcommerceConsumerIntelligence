import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          lime: '#a3e635',
          amber: '#fbbf24',
          red: '#f87171',
          pink: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 30px -6px rgba(34, 211, 238, 0.5)',
        'glow-violet': '0 0 30px -6px rgba(167, 139, 250, 0.5)',
        'glow-lime': '0 0 30px -6px rgba(163, 230, 53, 0.5)',
        'glow-amber': '0 0 30px -6px rgba(251, 191, 36, 0.5)',
        'glow-red': '0 0 30px -6px rgba(248, 113, 113, 0.5)',
        'glow-pink': '0 0 30px -6px rgba(244, 114, 182, 0.5)',
      },
      borderRadius: {
        'xl': '0.75rem',
        'lg': '0.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
