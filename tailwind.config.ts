import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navcolor: "var(--navcolor)",
        secondary: "var(--secondary)",
        primary: "var(--primary)",
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        custom540: "540px",
        custom390: "390px",
        custom860: "860px",
        custom890: "890px",
        custom895: "895px",
        custom1150: "1150px",
        custom1090: "1090px",
        custom410: "410px",
        custom960: "960px",
        custom1660: "1660px",
      },
    },
    fontFamily: {
      poppins: "var(--font-poppins)",
    },
  },
  plugins: [],
} satisfies Config;
