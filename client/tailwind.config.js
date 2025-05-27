/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "body"], // поддержка класса dark на <body>
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
