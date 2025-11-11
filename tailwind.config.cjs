module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {},
      boxShadow: {
        'glow-blue': '0 8px 30px rgba(59,130,246,0.18)',
        'glow-purple': '0 8px 30px rgba(139,92,246,0.14)'
      }
    }
  },
  plugins: []
}
