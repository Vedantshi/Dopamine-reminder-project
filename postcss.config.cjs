// For Tailwind v4 the PostCSS plugin moved into '@tailwindcss/postcss'
// Install with: npm install -D @tailwindcss/postcss
// Use explicit requires to ensure PostCSS resolves the plugin module correctly.
// This form works across environments where PostCSS expects actual plugin functions.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')
  ]
}
