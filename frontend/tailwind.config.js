/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gc: {
          primary: '#4902A2',
          'primary-600': '#5a16b8',
          'primary-700': '#390184',
          bg: '#f3f0f9',
          surface: '#ffffff',
          soft: '#f6f4fc',
          border: '#e8e3f4',
          border2: '#dcd5ec',
          text: '#1d1530',
          text2: '#443a5e',
          muted: '#837b97',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        gc: '14px',
      },
    },
  },
  plugins: [],
}
