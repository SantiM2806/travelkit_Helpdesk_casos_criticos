import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        'tk-bg':        'var(--bg)',
        'tk-bg2':       'var(--bg2)',
        'tk-bg3':       'var(--bg3)',
        'tk-border':    'var(--border)',
        'tk-border2':   'var(--border2)',
        'tk-text':      'var(--text)',
        'tk-text2':     'var(--text2)',
        'tk-text3':     'var(--text3)',
        'tk-accent':    'var(--accent)',
        'tk-accent2':   'var(--accent2)',
        'tk-green':     'var(--green)',
        'tk-green-bg':  'var(--green-bg)',
        'tk-amber':     'var(--amber)',
        'tk-amber-bg':  'var(--amber-bg)',
        'tk-orange':    'var(--orange)',
        'tk-orange-bg': 'var(--orange-bg)',
        'tk-red':       'var(--red)',
        'tk-red-bg':    'var(--red-bg)',
        'tk-blue':      'var(--blue)',
        'tk-blue-bg':   'var(--blue-bg)',
        'tk-violet':    'var(--violet)',
        'tk-violet-bg': 'var(--violet-bg)',
      },
      animation: {
        'spin-sync':    'spin 0.8s linear infinite',
        'pulse-red':    'pulse-red 1.8s ease-out infinite',
        'dot-bounce':   'dot-bounce 1.2s infinite ease-in-out',
        'card-land':    'cardLand 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-in':     'slideInCard 0.28s cubic-bezier(0.22,1,0.36,1) forwards',
        'shimmer-drop': 'shimmerDrop 1.2s ease-in-out infinite',
        'toast-in':     'toastIn 0.25s cubic-bezier(0.22,1,0.36,1) forwards',
        'toast-out':    'toastOut 0.28s ease forwards',
        'fade-up':      'fadeUp 0.38s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':      'fadeIn 0.25s ease forwards',
      },
    },
  },
  plugins: [],
};

export default config;
