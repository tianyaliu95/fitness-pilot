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
          DEFAULT: '#e8eef5',
          card: 'rgba(255, 255, 255, 0.78)',
          muted: 'rgba(236, 242, 248, 0.72)',
        },
        low: {
          DEFAULT: '#5b8def',
          light: '#e8f0fd',
          dark: '#3d6fd4',
        },
        high: {
          DEFAULT: '#f59e42',
          light: '#fef3e6',
          /** Dark enough for white text (~4.5:1+) */
          dark: '#c45f0f',
        },
        success: {
          DEFAULT: '#059669',
          soft: '#ecfdf5',
          text: '#047857',
        },
        danger: {
          DEFAULT: '#e11d48',
          soft: '#fff1f2',
          text: '#be123c',
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
        soft: '0 10px 30px rgba(26, 26, 46, 0.06)',
        card: '0 18px 50px rgba(26, 26, 46, 0.1)',
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Noto Sans SC"',
          '"Microsoft YaHei"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
