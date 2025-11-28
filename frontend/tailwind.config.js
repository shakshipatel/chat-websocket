/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Text colors
        text: {
          primary: "#394759",
          "primary-dark": "#FFFFF0",
          secondary: "#567191",
          "secondary-dark": "#FFFFF0",
          "primary-new": "#162029",
          "primary-new-dark": "#FFFFF0",
          "secondary-new": "#646E7D",
          "secondary-new-dark": "#FFFFF0",
          "primary-darker": "#00020F",
          "secondary-darker": "#3D3D3D",
          inverted: "#FFFFFF",
          "inverted-dark": "#00020F",
        },
        // Background colors
        bg: {
          opaque: "#FFFFFF",
          "opaque-dark": "#191919",
          "opacity-8": "rgba(255, 255, 255, 0.08)",
          "opacity-8-dark": "rgba(25, 25, 25, 0.08)",
          "opacity-16": "rgba(255, 255, 255, 0.16)",
          "opacity-16-dark": "rgba(25, 25, 25, 0.16)",
          light: "#F9FBFF",
          "light-dark": "rgba(25, 25, 25, 0.08)",
          regular: "#F0F3FA",
          "regular-dark": "rgba(255, 255, 255, 0.16)",
          accented: "#DFE5F3",
          "accented-dark": "rgba(255, 255, 255, 0.32)",
          inverted: "#000000",
          "inverted-dark": "#FFFFFF",
        },
        // Border colors
        border: {
          light: "#F2F6FC",
          "light-dark": "rgba(255, 255, 255, 0.16)",
          regular: "#E2E8F0",
          "regular-dark": "rgba(255, 255, 255, 0.32)",
        },
      },
      animation: {
        "bounce-slow": "bounce 1.5s infinite",
        "pulse-slow": "pulse 2s infinite",
      },
    },
  },
  plugins: [],
};
