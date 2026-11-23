import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eng: {
          canvas: "#f8fafc",
          panel: "#ffffff",
          subtle: "#f1f5f9",
          border: "#cbd5e1",
          borderStrong: "#94a3b8",
          charcoal: "#0f172a",
          slate: "#334155",
          muted: "#64748b",
          cobalt: "#0284c7",
          cobaltDark: "#0369a1",
          cobaltLight: "#e0f2fe",
          steel: "#1e293b",
          amber: "#d97706",
          emerald: "#059669",
          rose: "#e11d48",
        },
        udemy: {
          purple: "#0284c7",
          purpleDark: "#0369a1",
          purpleHover: "#0284c7",
          purpleLight: "#e0f2fe",
          black: "#0f172a",
          charcoal: "#1e293b",
          muted: "#64748b",
          border: "#cbd5e1",
          borderLight: "#e2e8f0",
          bg: "#f8fafc",
          card: "#ffffff",
          gold: "#d97706",
          bestseller: "#fef3c7",
          bestsellerText: "#92400e",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Courier New",
          "monospace",
        ],
      },
      boxShadow: {
        eng: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        engCard: "0 0 0 1px #cbd5e1, 0 1px 3px rgba(15, 23, 42, 0.05)",
        engHover: "0 0 0 1px #0284c7, 0 4px 6px -1px rgba(2, 132, 199, 0.1)",
        udemy: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        udemyCard: "0 0 0 1px #cbd5e1, 0 1px 3px rgba(15, 23, 42, 0.05)",
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
