import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'IBM Plex Sans', 'sans-serif'],
        mono: ['var(--font-ibm-mono)', 'IBM Plex Mono', 'monospace'],
        // Travelkit CRM (IDENTIDAD-VISUAL.md): tema claro con Inter
        inter: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Sistema de marca claro (IDENTIDAD-VISUAL.md) ──
        brand: {
          50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5',
          400: '#F87171', 500: '#EF4444', 600: '#E30613', 700: '#C70511',
          800: '#A1040E', 900: '#7F030B',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#DC2626',
        info:    '#3B82F6',
        'tk-surface':   '#FAFAFA',
        'tk-card-bd':   '#E5E7EB',
        'tk-ink':       '#0A0A0A',
        'tk-ink2':      '#6B7280',
        'tk-ink3':      '#9CA3AF',
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
        // ── IDENTIDAD-VISUAL.md ──
        'slide-up':     'slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
