import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1B2447",
        "navy-light": "#5C6A95",
        gold: "#3D5AC0",
        "gold-dark": "#2B3F94",
        purple: "#9355E0",
        cream: "#F7F8FC",
        champagne: "#EBEFFB",
        blush: "#F0EAFB",
        mint: "#D6F0E4",
        aqua: "#CFE9F2",
        peach: "#FBE6D6",
        pink: "#F6DCEC",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "3px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27, 36, 71, 0.04), 0 6px 20px rgba(27, 36, 71, 0.06)",
        "card-hover":
          "0 2px 4px rgba(27, 36, 71, 0.06), 0 18px 40px rgba(27, 36, 71, 0.12)",
        luxe: "0 30px 60px -25px rgba(27, 36, 71, 0.28)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "60%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "bg-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, -2%, 0) scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.3s ease-out both",
        float: "float 5s ease-in-out infinite",
        "bg-drift": "bg-drift 18s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
