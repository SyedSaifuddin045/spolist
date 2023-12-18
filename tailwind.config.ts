import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#a800ff",
          "secondary": "#00af07",
          "accent": "#94c600",
          "neutral": "#1a1125",
          "base-100": "#e9ffff",
          "info": "#00b4ff",
          "success": "#019900",
          "warning": "#ec9900",
          "error": "#d93f59",
        },
      },
    ],
  },
  plugins: [daisyui],
}
export default config
