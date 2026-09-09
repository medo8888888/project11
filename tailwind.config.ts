import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 8px 24px -8px rgb(15 23 42 / 0.10)",
        popover: "0 12px 32px -8px rgb(15 23 42 / 0.18)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #818cf8 100%)",
        "mesh-light": "radial-gradient(at 20% 0%, rgba(99,102,241,0.10) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(129,140,248,0.10) 0px, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 220ms cubic-bezier(0.16,1,0.3,1)",
        "toast-in": "toastIn 250ms cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        toastIn: { from: { opacity: "0", transform: "translateY(-8px) scale(0.98)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
      },
    },
  },
  plugins: [],
};
export default config;
