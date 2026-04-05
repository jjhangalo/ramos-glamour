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
        "brand-mauve": "var(--brand-mauve)",
        "brand-olive": "var(--brand-olive)",
        "brand-charcoal": "var(--brand-charcoal)",
        "brand-white": "var(--brand-white)",
      },
    },
  },
};

export default config;
