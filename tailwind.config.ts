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
        cream: "#F7F8FA",
      },
    },
  },
  plugins: [],
};

export default config;
