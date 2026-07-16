import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark surfaces + text
        base: "#07080f",
        surface: "#12141f",
        "surface-2": "#1a1d2b",
        ink: "#EAEDF7",
        muted: "#9BA1B8",
        line: "#282C3B",

        // FIFA World Cup 2026 palette
        fifared: "#FF3B4E",
        "fifared-dark": "#D92B3D",
        fifacyan: "#22D3EE",
        fifablue: "#3E7BFF",
        fifaorange: "#FF8A3D",
        fifapurple: "#A855F7",
        fifayellow: "#FBD34D",

        // Legacy names kept (remapped to dark/vibrant) as a safety net
        navy: "#1B2447",
        "navy-light": "#5C6A95",
        gold: "#FF3B4E",
        "gold-dark": "#D92B3D",
        purple: "#A855F7",
        cream: "#07080f",
        champagne: "#122019",
        blush: "#160e22",
        mint: "#123021",
        aqua: "#0f2a33",
        peach: "#2a1f12",
        pink: "#2a1220",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "3px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)",
        "card-hover":
          "0 2px 6px rgba(0,0,0,0.5), 0 20px 44px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,59,78,0.14)",
        luxe: "0 30px 60px -25px rgba(0,0,0,0.7)",
        glow: "0 0 24px -4px rgba(255,59,78,0.5)",
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
          "50%": { transform: "translateY(-5px)" },
        },
        "bg-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(2%,-3%,0) scale(1.08)" },
          "66%": { transform: "translate3d(-2%,2%,0) scale(1.04)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "bands-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.3s ease-out both",
        float: "float 5s ease-in-out infinite",
        "bg-drift": "bg-drift 24s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "bands-move": "bands-move 22s linear infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
