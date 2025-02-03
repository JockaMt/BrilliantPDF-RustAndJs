module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        default: '#115f5f',
      },
      backgroundImage: {
        background: 'url(./src/assets/background.jpg)',
      },
      rotate: {
        "x-0" : 'rotateX(0deg)',
        'x-180': 'rotateX(180deg)',
      }
    },
  },
  plugins: [],
};