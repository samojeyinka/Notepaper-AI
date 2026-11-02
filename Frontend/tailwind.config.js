/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#54786f",
        // Sage brand accent used across the current interface
        plum: {
          50: "#edf3ef",
          100: "#e4ece6",
          200: "#c7d5cb",
          300: "#b9cbbf",
          400: "#8da99d",
          500: "#6f9184",
          600: "#54786f",
          700: "#42675a",
          800: "#355c53",
          900: "#294b43",
        },
        "background-light": "#F8FAFC",
        "background-dark": "#0F172A",
        "paper-cream": "#FDFBF7",
        "paper": "#FDFBF7",
        "paper-darker": "#F5F1E9",
        "ink-black": "#1A1A1A",
        "note-yellow": "#FBBF24",
        "note-green": "#10B981",
        "note-purple": "#A78BFA",
        "organic-purple": "#A78BFA",
        "washi-tape": "#F472B6",
        accent: {
          yellow: "#FBBF24",
          green: "#10B981",
          pink: "#F472B6"
        }
      },
      fontFamily: {
        display:        ["Plus Jakarta Sans", "sans-serif"],
        "serif-elegant":["Crimson Pro", "serif"],
        handwritten:    ["Architects Daughter", "cursive"],
        // Note editor fonts — ids match frontend fontFamily state
        handwriting:    ["Kalam", "cursive"],           // id: handwriting
        handwriting2:   ["Caveat", "cursive"],          // id: casual
        handwriting3:   ["Indie Flower", "cursive"],    // id: fun
        sketch:         ["Shadows Into Light", "cursive"], // id: shadows
        dancing:        ["Dancing Script", "cursive"],  // id: dancing
        // legacy aliases kept for backwards compat
        handwriting1:   ["Dancing Script", "cursive"],
        casual:         ["Caveat", "cursive"],
      },
      boxShadow: {
        paper: "2px 2px 5px rgba(0,0,0,0.05), 5px 15px 30px rgba(0,0,0,0.07)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}