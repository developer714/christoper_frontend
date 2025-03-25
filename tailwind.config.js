// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#3498db',
          primaryLight: '#5dade2',
          primaryDark: '#2980b9',
          secondary: '#1abc9c',
          secondaryLight: '#48c9b0',
          secondaryDark: '#16a085',
          background: '#f8f9fa',
          text: '#2c3e50',
          textLight: '#7f8c8d',
          error: '#e74c3c',
          success: '#2ecc71',
          warning: '#f39c12',
          gray: '#bdc3c7',
          grayLight: '#ecf0f1',
          grayDark: '#95a5a6',
          border: '#dfe4ea',
        },
        boxShadow: {
          custom: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite reverse',
          'bounce-delay-1': 'bounce 1s infinite',
          'bounce-delay-2': 'bounce 1s infinite 0.2s',
          'bounce-delay-3': 'bounce 1s infinite 0.4s',
        },
      },
    },
    plugins: [],
  };