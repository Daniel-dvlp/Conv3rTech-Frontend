import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // AQUÍ DEFINIMOS LOS COLORES DE LA MARCA CONV3RTECH
      colors: {
        'conv3r-dark': '#00012A',  // Tu azul oscuro principal
        'conv3r-gold': '#FFB300',  // Tu color de acento dorado/amarillo
        'conv3r-text-primary': '#FFFFFF', // Texto principal sobre fondos oscuros
        'conv3r-text-secondary': '#A0AEC0', // Texto secundario (gris)
      },
    },
  },
  plugins: [
    tailwindScrollbar,
  ],
}

