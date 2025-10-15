// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // PENTING: Tentukan file mana yang harus dipindai Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Memindai semua file React Anda
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}