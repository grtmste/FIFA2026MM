import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#262338",
        "navy-light": "#6B6680",
        gold: "#C9A876",
        "gold-dark": "#AD8A57",
        cream: "#FBF8F4",
        champagne: "#F4ECE0",
        blush: "#F6E9EA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      borderRadius: {
        sm: "3px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(80, 64, 48, 0.04), 0 6px 20px rgba(80, 64, 48, 0.06)",
        "card-hover":
          "0 2px 4px rgba(80, 64, 48, 0.06), 0 18px 40px rgba(80, 64, 48, 0.13)",
        luxe: "0 30px 60px -25px rgba(80, 64, 48, 0.28)",
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
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        "pop-in": "pop-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
