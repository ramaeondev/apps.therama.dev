export default {
  plugins: {
    // Tailwind v4 handles vendor prefixing via Lightning CSS internally,
    // so a separate autoprefixer pass is no longer needed.
    '@tailwindcss/postcss': {},
  },
}
