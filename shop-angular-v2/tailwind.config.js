/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        shopee: {
          primary: '#ee4d2d',
          orange: '#f53d2d',
          bg: '#f5f5f5',
          border: '#e8e8e8',
          text: '#222222',
          muted: '#757575',
          mall: '#d0011b',
        }
      },
      boxShadow: {
        'shopee': '0 1px 1px 0 rgba(0,0,0,.05)',
        'shopee-hover': '0 1px 20px 0 rgba(0,0,0,.05)',
      }
    },
  },
  plugins: [],
}
