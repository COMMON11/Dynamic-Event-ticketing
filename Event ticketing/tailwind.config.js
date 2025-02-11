/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Lexend', 'serif']
      },
      colors: {
        redishpink: {
          100: '#ff4d6d',
        }
      },
    },
  },
  plugins: [],
}
