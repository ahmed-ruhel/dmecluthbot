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
        udemy: {
          purple: "#a435f0",
          purpleDark: "#5624d0",
          purpleHover: "#8710d8",
          purpleLight: "#f6efff",
          purpleBorder: "#d8b4fe",
          black: "#1c1d1f",
          charcoal: "#2d2f31",
          muted: "#6a6f73",
          border: "#d1d7dc",
          borderLight: "#e4e8eb",
          bg: "#ffffff",
          pageBg: "#ffffff",
          sidebarBg: "#f7f9fa",
          card: "#ffffff",
          gold: "#b4690e",
          star: "#e59819",
          bestseller: "#eceb98",
          bestsellerText: "#3d3c0a",
          premium: "#5624d0",
          roleplay: "#eceb98",
          newBadge: "#1e6055",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Udemy Sans",
          "SF Pro Text",
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
        udemy: "0 2px 4px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.08)",
        udemyCard: "0 0 0 1px #d1d7dc, 0 2px 4px rgba(0,0,0,.08)",
        udemyHover: "0 4px 16px rgba(0,0,0,.14)",
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
