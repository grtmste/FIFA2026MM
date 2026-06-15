import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0D1B2A",
        "navy-light": "#5C6F8A",
        gold: "#C9A227",
        "gold-dark": "#A8861F",
        cream: "#F7F8FA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(13, 27, 42, 0.04), 0 4px 16px rgba(13, 27, 42, 0.05)",
        "card-hover":
          "0 2px 4px rgba(13, 27, 42, 0.06), 0 12px 28px rgba(13, 27, 42, 0.10)",
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
