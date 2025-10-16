// postcss.config.js atau postcss.config.cjs
// Pastikan ini menggunakan sintaks ES Module atau CommonJS yang benar
module.exports = {
  plugins: {
    // PostCSS modern mencari paket secara otomatis berdasarkan nama key
    'tailwindcss': {},
    'autoprefixer': {},
  }
};
