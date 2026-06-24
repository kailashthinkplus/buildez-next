/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ✅ Web UI only (correct, relative paths)
    "./app/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}",

    // ⛔ Explicit hard exclusions (also relative)
    "!./app/api/**/*",
    "!./modules/builder/ai-v8/**/*",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
