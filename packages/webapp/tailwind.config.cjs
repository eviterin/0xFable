/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom box shadow that adds a 'highlight' effect 
      // For example, add 'shadow-highlight shadow-orange-300' to className
      // See: https://tailwindcss.com/docs/box-shadow#customizing-your-theme
      boxShadow: {
        'highlight': '0 0 20px', 
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["coffee"],
  },
}

module.exports = config