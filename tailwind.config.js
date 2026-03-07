/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./maps/**/*.{js,jsx,ts,tsx}",
    "./charts/**/*.{js,jsx,ts,tsx}",
    "./tables/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#020617",
        "surface-muted": "#020617",
        primary: {
          DEFAULT: "#22d3ee",
          500: "#22d3ee"
        }
      },
      boxShadow: {
        "soft-lg": "0 18px 45px rgba(15,23,42,0.75)"
      }
    }
  },
  plugins: []
};

