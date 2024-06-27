import tailwindcssAnimate from 'tailwindcss-animate'
import tailwindcssAspectRatio from '@tailwindcss/aspect-ratio'
import type { Config } from 'tailwindcss'

export default {
  content: [
    './**/*.?([cm])[jt]s?(x)',
    './**/*.vue',
    './**/*.md',
    './.vitepress/**/*.?([cm])[jt]s?(x)',
    './.vitepress/**/*.vue',
    './.vitepress/**/*.md',
  ],
  theme: {
    extend: {},
  },
  plugins: [tailwindcssAspectRatio, tailwindcssAnimate],
} satisfies Config
