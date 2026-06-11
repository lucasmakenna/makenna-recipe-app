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
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyan: {
          50: '#EAFBFC', 300: '#7ED1DC', 400: '#4FB8C9', 500: '#3BA3B4',
        },
        hibiscus: {
          50: '#FCEBED', 300: '#E08A95', 400: '#C5293A', 500: '#A82130',
        },
        royal: {
          400: '#1F5FB6', 500: '#1A4F99',
        },
        ink: {
          100: '#E7E9EC', 200: '#D2D6DC', 400: '#8B96A3', 500: '#5C6B7A', 600: '#3A4754', 700: '#1F2A33',
        },
      },
    },
  },
  plugins: [],
};
export default config;
