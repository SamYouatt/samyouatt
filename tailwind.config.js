/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html", "./theme/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        "hero": ["MADEDillan", "serif"],
      }
    },
  },
  plugins: [
      require("@tailwindcss/typography"),
  ],
}

