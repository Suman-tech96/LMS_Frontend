/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    // Keep existing custom CSS resets intact to guarantee 0 design regressions
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3d6e4e',
          hover: '#2e543b',
          light: '#4d8560',
          container: '#d8f0de',
          'on-container': '#173d23',
        },
        accent: {
          DEFAULT: '#705c30',
          hover: '#554020',
          container: '#f8e0a8',
          'on-container': '#473510',
        },
        academic: {
          bg: '#faf6f0',
          surface: '#f5f1ea',
          card: '#ffffff',
          charcoal: '#262b28',
          muted: '#7e857e',
          border: '#e4e0d8',
        },
      },
      fontFamily: {
        serif: ['Literata', 'Georgia', 'Cambria', 'serif'],
        sans: ['Nunito Sans', 'Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
      },
      boxShadow: {
        academic: '0 6px 18px -2px rgba(38, 43, 40, 0.07), 0 2px 6px -1px rgba(38, 43, 40, 0.04)',
        glow: '0 0 25px rgba(61, 110, 78, 0.22)',
      },
    },
  },
  plugins: [],
};
