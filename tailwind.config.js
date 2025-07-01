import tailwindScrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(5px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      colors: {
        // 🎨 Paleta de colores personalizada Conv3rTech
        "conv3r-dark": "#00012A",
        "conv3r-gold": "#FFB300",
        "conv3r-text-primary": "#FFFFFF",
        "conv3r-text-secondary": "#A0AEC0",
      },
    },
  },
  plugins: [tailwindScrollbar],
};
