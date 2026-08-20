/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#05070C',
        slab: '#0B1220',
        ice: '#56E9FF',
        signal: '#FF3D9A',
        haze: '#6B4DFF',
        sodium: '#FFB25C',
        vapor: '#C9D6E4',
        mute: '#6C7B8F',
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Archivo', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        signage: '-0.03em',
        meta: '0.18em',
      },
      screens: {
        xs: '390px',
      },
      transitionTimingFunction: {
        travel: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
