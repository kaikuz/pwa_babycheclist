/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--c-page)',
        ink: 'var(--c-ink)',
        soft: 'var(--c-soft)',
        card: 'var(--c-card)',
        edge: 'var(--c-edge)',
        euca: 'var(--c-euca)',
        'euca-soft': 'var(--c-euca-soft)',
        honey: 'var(--c-honey)',
        'honey-soft': 'var(--c-honey-soft)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(46, 58, 51, 0.06), 0 4px 14px rgba(46, 58, 51, 0.05)',
      },
    },
  },
  plugins: [],
}
