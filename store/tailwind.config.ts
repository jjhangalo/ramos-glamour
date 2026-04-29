import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-bg": "var(--brand-bg)",
        "brand-midnight": "var(--brand-midnight)",
        "brand-gold": "var(--brand-gold)",
        "brand-blush": "var(--brand-blush)",
        "brand-white": "var(--brand-white)",
        "brand-olive": "var(--brand-olive)",
        "brand-charcoal": "var(--brand-charcoal)",
      },
      fontFamily: {
        serif: ["var(--font-cormorant-garamond)", "serif"],
        sans: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
};

export default config;
