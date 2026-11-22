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
        bg: "#0B0D10",
        surface: "#12161B",
        surfaceHover: "#181E25",
        line: "#232A33",
        lineBright: "#333D4B",
        textMain: "#E8ECF1",
        textMuted: "#8B96A5",
        ember: {
          DEFAULT: "#FF6A3D",
          glow: "rgba(255, 106, 61, 0.25)",
          bright: "#FF8A65",
          dark: "#D94A1E",
        },
        cyan: {
          DEFAULT: "#6FD3E8",
          glow: "rgba(111, 211, 232, 0.2)",
          bright: "#95E2F2",
          dark: "#3BABC4",
        },
        success: "#5BD18B",
        warning: "#F2B84B",
        danger: "#FF4D4D",
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        thermal: "0 0 25px -5px rgba(255, 106, 61, 0.3)",
        cyanGlow: "0 0 25px -5px rgba(111, 211, 232, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
