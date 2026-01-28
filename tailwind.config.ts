import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bordo: {
          DEFAULT: "#730d32",
          dark: "#5a0a28",
          light: "#8c103d",
        },
        amarillo: {
          DEFAULT: "#f7b643",
          dark: "#e5a331",
          light: "#f9c76a",
        },
        // Grises minimalistas para admin
        slate: {
          25: "#fcfcfd",
          75: "#f3f6f9",
          150: "#e9eef4",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      boxShadow: {
        "soft-xs": "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        "soft-sm":
          "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "soft-md":
          "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "soft-lg":
          "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
      },
      borderRadius: {
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
