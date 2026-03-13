/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(240 10% 4%)",
        foreground: "hsl(0 0% 98%)",
        muted: "hsl(240 3.7% 15.9%)",
        "muted-foreground": "hsl(240 5% 64.9%)",
        border: "hsl(240 3.7% 15.9%)",
        ring: "hsl(240 4.9% 83.9%)",
        primary: "hsl(79 100% 65%)",
        "primary-foreground": "hsl(240 10% 4%)"
      },
      borderRadius: {
        lg: "14px",
        md: "12px",
        sm: "10px"
      }
    }
  },
  plugins: []
};

