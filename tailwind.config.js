/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A78BFA",
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
        accent: {
          yellow: "#FBBF24",
          green: "#10B981",
          pink: "#F472B6"
        }
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        "serif-elegant": ["Crimson Pro", "serif"],
        handwritten: ["Architects Daughter", "cursive"],
        handwriting2: ["Caveat", "cursive"],
        sketch: ["Shadows Into Light", "cursive"],
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