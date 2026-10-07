import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk Variable"', '"Inter Variable"', "system-ui", "sans-serif"],
      },
        colors: {
          night: {
            950: "#08090c",
            900: "#0d0f14",
            800: "#14171e",
            700: "#1c2029",
          },
          gold: "#D9B45A",
          tile: "#0E3B2E",
          fest: {
            arctic: "#BCDDDC",
            lace: "#FFEDD1",
            bubblegum: "#FDC1B4",
            coral: "#FE9179",
            sage: "#CFB97E",
            gold: "#B89D47",
            spruce: "#355E58",
            peacock: "#053229",
          },
          ink: {
            950: "#030208",
            900: "#070512",
            850: "#0c091f",
            800: "#130e2c",
            700: "#1d1542",
            600: "#2a1e5c",
          },
          brand: {
            violet: "#8b5cf6",
            fuchsia: "#e879f9",
            cyan: "#00f0ff",
            amber: "#fbbf24",
            lime: "#10b981",
            laser: "#ff007f",
          },
        },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.2)",
        "neon-violet": "0 0 25px rgba(139, 92, 246, 0.5), 0 0 70px rgba(139, 92, 246, 0.2)",
        "neon-fuchsia": "0 0 25px rgba(232, 121, 249, 0.5), 0 0 70px rgba(232, 121, 249, 0.2)",
        "neon-amber": "0 0 20px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.2)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-18px,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "grid-drift": {
          "0%": { transform: "perspective(400px) rotateX(60deg) translateY(0)" },
          "100%": { transform: "perspective(400px) rotateX(60deg) translateY(40px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      animation: {
        "fade-up": "fade-up .7s cubic-bezier(.2,.7,.2,1) both",
        float: "float 9s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "grid-drift": "grid-drift 3s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "scanline": "scanline 8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
