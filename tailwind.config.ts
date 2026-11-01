import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#1C1917",
          white: "#FFFFFF",
          accent: "#A84335",
          "accent-bg": "#F9ECE9",
          success: "#26754B",
          warning: "#F59E0B",
        },
        ink: {
          DEFAULT: "#1C1917",
          soft: "#44403C",
          muted: "#6B625C",
          faint: "#8B8179",
          line: "#E6E0D8",
        },
        paper: {
          DEFAULT: "#FAFAF9",
          soft: "#F4F1EC",
          tint: "#ECE7DF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "11": ["11px", { lineHeight: "1.4" }],
        "12": ["12px", { lineHeight: "1.5" }],
        "13": ["13px", { lineHeight: "1.5" }],
        "13.5": ["13.5px", { lineHeight: "1.5" }],
        "14": ["14px", { lineHeight: "1.65" }],
        "15": ["15px", { lineHeight: "1.6" }],
        "18": ["18px", { lineHeight: "1.3" }],
        "22": ["22px", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
        "28": ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "30": ["30px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "44": ["44px", { lineHeight: "1.05", letterSpacing: "-0.035em" }],
        "56": ["56px", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    maxWidth: {
        container: "1320px",
      },
      spacing: {
        "container-x": "24px",
      },
      boxShadow: {
        floating: "0 1px 4px rgba(0,0,0,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up .35s ease-out both",
        "slide-in": "slide-in .28s cubic-bezier(.22,.61,.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
