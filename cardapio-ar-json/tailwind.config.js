/** Identidade visual: fundo escuro quente (carvão → café) e um único metal: champagne. */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        carvao: "#14110F", // fundo base
        grafite: "#1E1A17", // cartões
        cafe: "#2A1F18", // superfícies elevadas
        linha: "#3A2F27", // bordas
        champagne: { DEFAULT: "#D9C29A", forte: "#E8D4AE", suave: "#A8946F" },
        marfim: { DEFAULT: "#F1E9DB", suave: "#BDB2A0" }, // texto principal / secundário
        brasa: "#C4573A", // erro
        musgo: "#7E9A6B", // sucesso
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
      },
      borderRadius: { card: "14px", botao: "10px" },
      fontSize: {
        corpo: ["1rem", { lineHeight: "1.6" }],
        apoio: ["0.875rem", { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [],
};
