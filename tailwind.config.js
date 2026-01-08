/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ethaum: {
          bg: "#050505",
          green: "#CCFF00", // The Acid Lime
          text: "#EAEAEA",
          gray: "#888888"
        },
      },
      fontFamily: {
        // Ensuring we use a clean sans stack
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        bold: '700',
      }
    },
  },
  plugins: [],
}