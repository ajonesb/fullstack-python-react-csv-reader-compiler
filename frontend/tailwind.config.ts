import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        'primary-dark': '#0056b3',
        success: '#28a745',
        error: '#dc3545',
        'error-light': '#fee',
        'error-text': '#c33',
        'error-border': '#fcc',
        'success-light': '#efe',
        'success-text': '#3c3',
        'success-border': '#cfc',
        gray: {
          50: '#f8f9fa',
          100: '#f5f5f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
