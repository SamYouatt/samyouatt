/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./templates/**/*.html", "./theme/**/*.html"],
  content: [],
  theme: {
    extend: {},
  },
  plugins: [
      require("@tailwindcss/typography"),
  ],
}

