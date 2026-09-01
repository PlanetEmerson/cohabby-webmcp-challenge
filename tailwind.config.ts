import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B4A',
          light: '#FF896E',
          dark: '#EE5530',
          surface: '#FFEFE9',
          ink: '#C2401F',
        },
        info: {
          DEFAULT: '#00A699',
          light: '#33B8AD',
          dark: '#00756B',
          surface: '#E3F4F1',
        },
        success: {
          DEFAULT: '#34C759',
          light: '#53D769',
          dark: '#28A745',
          surface: '#E7F8EC',
        },
        warning: {
          DEFAULT: '#E1A33B',
          light: '#E7B562',
          dark: '#B4822F',
          surface: '#FBF4E7',
        },
        accent: {
          DEFAULT: '#FF9800',
          light: '#FFAD33',
          dark: '#F57C00',
          surface: '#FFF3E0',
        },
        gold: {
          DEFAULT: '#F4C95D',
          light: '#F7D87D',
          dark: '#D4A93D',
          surface: '#FDF8EC',
        },
        error: {
          DEFAULT: '#C03222',
          light: '#CD5B4E',
          dark: '#9A281B',
          surface: '#FBEDEA',
        },
        neutral: {
          0: '#FFFCFA',
          50: '#FBF5F1',
          100: '#F5EBE4',
          200: '#EADCD2',
          300: '#D8C4B6',
          400: '#B89F8F',
          500: '#997F6E',
          600: '#7A6557',
          700: '#5A4639',
          800: '#3F2E26',
          900: '#2B1F19',
          950: '#17100C',
        },
        text: {
          primary: '#2B1F19',
          secondary: '#7A6557',
          tertiary: '#997F6E',
          disabled: '#B89F8F',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.25', letterSpacing: '-0.2px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        button: ['16px', { lineHeight: '1', letterSpacing: '0.5px', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0 2px 8px rgba(43, 31, 25, 0.08)',
        elevated: '0 12px 32px rgba(63, 46, 38, 0.12)',
      },
      transitionDuration: {
        causal: '180ms',
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
