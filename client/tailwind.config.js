/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Neue Haas Grotesk Display Pro"', '"Neue Haas Grotesk"', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['"Neue Haas Grotesk Display Pro"', '"Neue Haas Grotesk"', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "surface-dim": "#131313",
        "on-surface": "#e4e2e1",
        "outline-variant": "#444748",
        "outline": "#8e9192",
        "inverse-primary": "#5f5e5e",
        "tertiary-fixed": "#ffdbd1",
        "secondary-fixed-dim": "#c9c6c2",
        "inverse-surface": "#e4e2e1",
        "surface-tint": "#c8c6c5",
        "surface-container-highest": "#353535",
        "on-secondary-fixed": "#1c1c19",
        "primary-fixed-dim": "#c8c6c5",
        "primary-container": "#121212",
        "on-surface-variant": "#c4c7c7",
        "on-primary": "#313030",
        "on-secondary-fixed-variant": "#474743",
        "surface-variant": "#353535",
        "surface-bright": "#393939",
        "on-tertiary": "#571e0d",
        "on-tertiary-fixed": "#3b0900",
        "tertiary-fixed-dim": "#ffb5a0",
        "secondary-fixed": "#e5e2dd",
        "on-primary-fixed-variant": "#474646",
        "on-secondary-container": "#b7b5b0",
        "error": "#ffb4ab",
        "surface": "#131313",
        "on-primary-fixed": "#1c1b1b",
        "surface-container-high": "#2a2a2a",
        "surface-container-low": "#1b1c1c",
        "on-primary-container": "#7e7d7d",
        "on-tertiary-fixed-variant": "#743421",
        "on-error": "#690005",
        "error-container": "#93000a",
        "primary-fixed": "#e5e2e1",
        "on-background": "#e4e2e1",
        "surface-container": "#1f2020",
        "on-tertiary-container": "#b76852",
        "inverse-on-surface": "#303030",
        "tertiary-container": "#2a0500",
        "surface-container-lowest": "#0e0e0e",
        "on-error-container": "#ffdad6",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}
