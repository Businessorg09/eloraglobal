import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        "sidebar-width": "16rem", "gutter-xs": "0.25rem", "header-height": "4rem", "gutter-xl": "2rem", "sidebar-collapsed-width": "4.5rem", "gutter-lg": "1.5rem", "gutter-sm": "0.5rem", "tree-node-gap-x": "2.5rem", "gutter-md": "1rem", "tree-node-gap-y": "3.5rem", "margin-page": "2rem"
      },
      fontSize: {
        "body-sm": [ "12px", { "lineHeight": "16px", "fontWeight": "400" } ], "headline-md": [ "16px", { "lineHeight": "24px", "fontWeight": "600" } ], "headline-lg": [ "20px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" } ], "body-md": [ "14px", { "lineHeight": "20px", "fontWeight": "400" } ], "display-lg": [ "32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" } ], "headline-xl": [ "24px", { "lineHeight": "32px", "letterSpacing": "-0.015em", "fontWeight": "700" } ], "metric-display": [ "28px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "700" } ], "label-md": [ "12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "600" } ], "label-sm": [ "11px", { "lineHeight": "14px", "letterSpacing": "0.04em", "fontWeight": "600" } ], "body-lg": [ "16px", { "lineHeight": "24px", "fontWeight": "400" } ]
      },
      colors: {
        surface: "#f8f9ff", "surface-container-high": "#dce9ff", "on-primary-fixed-variant": "#003dab", primary: "#003fb1", "outline-variant": "#c3c5d7", "tertiary-fixed": "#6ffbbe", error: "#ba1a1a", "secondary-container": "#316bf3", "on-primary-fixed": "#00174d", "inverse-primary": "#b5c4ff", "secondary-fixed-dim": "#b4c5ff", "on-tertiary-fixed": "#002113", "on-secondary": "#ffffff", "on-primary-container": "#d4dcff", background: "#f8f9ff", "surface-container-lowest": "#ffffff", "surface-container-low": "#eff4ff", "surface-variant": "#d3e4fe", "on-primary": "#ffffff", "on-tertiary-fixed-variant": "#005236", "inverse-surface": "#213145", "tertiary-container": "#006f4b", "surface-tint": "#1353d8", secondary: "#0051d5", "on-secondary-container": "#fefcff", "primary-container": "#1a56db", "error-container": "#ffdad6", "surface-container-highest": "#d3e4fe", "on-surface-variant": "#434654", outline: "#737686", "on-error-container": "#93000a", "secondary-fixed": "#dbe1ff", tertiary: "#005438", "inverse-on-surface": "#eaf1ff", "on-tertiary": "#ffffff", "on-secondary-fixed": "#00174b", "on-error": "#ffffff", "on-tertiary-container": "#68f5b8", "tertiary-fixed-dim": "#4edea3", "surface-dim": "#cbdbf5", "primary-fixed": "#dbe1ff", "surface-bright": "#f8f9ff", "primary-fixed-dim": "#b5c4ff", "on-surface": "#0b1c30", "on-background": "#0b1c30", "on-secondary-fixed-variant": "#003ea8", "surface-container": "#e5eeff",
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdfff',
          400: '#52a5ff',
          500: '#1d7bfd',
          600: '#0b63e5',
          700: '#084dc0',
          900: '#072b6b'
        },
        slateCard: '#0f1f38',
        surfaceBg: '#f4f7fc',
        borderLight: '#eef2f7'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        "body-sm": [ "Inter" ], "headline-md": [ "Plus Jakarta Sans" ], "headline-lg": [ "Plus Jakarta Sans" ], "body-md": [ "Inter" ], "display-lg": [ "Plus Jakarta Sans" ], "headline-xl": [ "Plus Jakarta Sans" ], "metric-display": [ "Plus Jakarta Sans" ], "label-md": [ "Inter" ], "label-sm": [ "Inter" ], "body-lg": [ "Inter" ]
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float-up': 'floatUp 1.5s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(1.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}

export default config
