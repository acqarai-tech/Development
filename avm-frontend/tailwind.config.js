/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#fbfaf8',
        accent: '#b87333',
        'accent-dark': '#b57a3f',
        ink: '#0a0a0a',
        muted: '#6b7280',
        line: '#e5e7ec',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(20, 14, 8, 0.06)',
        sm: '0 1px 1.5px rgba(20, 14, 8, 0.08), 0 1px 1px rgba(20, 14, 8, 0.06)',
        md: '0 4px 12px -2px rgba(20, 14, 8, 0.10), 0 2px 6px -2px rgba(20, 14, 8, 0.08)',
        lg: '0 12px 32px -6px rgba(20, 14, 8, 0.16), 0 4px 12px -4px rgba(20, 14, 8, 0.10)',
        glow: '0 0 0 1px rgba(184, 115, 51, 0.08), 0 8px 24px -4px rgba(184, 115, 51, 0.20)',
      },
    },
  },
  plugins: [],
}
