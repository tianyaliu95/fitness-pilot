/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#faf9f7',
          card: '#ffffff',
          muted: '#f3f1ed',
        },
        low: {
          DEFAULT: '#5b8def',
          light: '#e8f0fd',
          dark: '#3d6fd4',
        },
        high: {
          DEFAULT: '#f59e42',
          light: '#fef3e6',
          dark: '#e07a1a',
        },
        ink: {
          DEFAULT: '#1a1a2e',
          muted: '#6b7280',
          faint: '#9ca3af',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 16px rgba(0,0,0,0.06)',
        card: '0 4px 24px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
