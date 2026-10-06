/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C4EA6",
        // Mature brand accent — same purple family as the logo, without the neon AI tint
        plum: {
          50: "#F7F3FB",
          100: "#ECE4F7",
          200: "#DCCCF0",
          300: "#C2AAE2",
          400: "#A487D0",
          500: "#8465BC",
          600: "#6C4EA6",
          700: "#583D8B",
          800: "#452F6E",
          900: "#322152",
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
        "note-green":"#10B981",
         "note-yellow":"#FBBF24",
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