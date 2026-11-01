import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cei: {
          orange: "#DD8427",
          "orange-hover": "#C7731E",
          "orange-light": "#FFF7ED",
          "orange-dark": "#B06014",
          slate: {
            950: "#050811",
            900: "#0A1128",
            850: "#0F172A",
            800: "#1E293B",
            700: "#334155",
            600: "#475569",
            500: "#64748B",
            400: "#94A3B8",
            300: "#CBD5E1",
            200: "#E2E8F0",
            100: "#F1F5F9",
            50: "#F8FAFC",
          },
        },
      },
      fontFamily: {
        tech: ["Rajdhani", "system-ui", "sans-serif"],
        sans: ["Roboto", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        "cei-glow": "0 0 20px -3px rgba(221, 132, 39, 0.4)",
        "cei-card": "0 4px 20px -2px rgba(0, 0, 0, 0.25), 0 2px 6px -1px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;

