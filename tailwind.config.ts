import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#132A3E",
        paper: "#F6F3EC",
        brass: "#C98A3B",
        "brass-dark": "#A66F2A",
        found: "#3E7A5C",
        alert: "#C1483B",
        line: "#DED7C7",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        tag: "22px",
      },
    },
  },
  plugins: [],
};

export default config;
