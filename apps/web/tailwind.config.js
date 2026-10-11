/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ThoughtStream brand palette
        stone: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#EFEDEB",
          300: "#E7E5E4",
          400: "#D6D3D1",
          500: "#A8A29E",
          600: "#78716C",
          700: "#57534E",
          800: "#292524",
          900: "#1C1917",
          950: "#0C0A09",
        },
        ts: {
          primary: "#78716C",       // Stone — anchors UI elements, links, icons
          secondary: "#A8A29E",     // Sage — supporting accents, dividers
          tertiary: "#1C1917",      // Warm Black — emphasis, strong headings
          bg: "#FAFAF9",            // Warm white page background
          surface: "#F5F5F4",       // Card and section backgrounds
          raised: "#EFEDEB",        // Hover states, subtle callout blocks
          text: "#1C1917",          // Body copy, headings
          muted: "#57534E",         // Bylines, metadata, captions
          faint: "#A8A29E",         // Placeholders, disabled labels
          border: "#E7E5E4",        // Border Subtle
          borderMedium: "#D6D3D1",  // Border Medium
          borderStrong: "#A8A29E",  // Border Strong
          // Semantic
          success: "#65A30D",
          warning: "#CA8A04",
          error: "#DC2626",
          info: "#78716C",
        },
      },
      fontFamily: {
        serif: ["'Libre Baskerville'", "Georgia", "'Times New Roman'", "serif"],
        display: ["'Libre Baskerville'", "Georgia", "'Times New Roman'", "serif"],
        sans: ["Inter", "-apple-system", "'Segoe UI'", "Helvetica", "sans-serif"],
        mono: ["'Source Code Pro'", "'Fira Code'", "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0px",
        none: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "9999px",
      },
      boxShadow: {
        DEFAULT: "none",
        none: "none",
        sm: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        inner: "none",
      },
    },
  },
  plugins: [],
};
