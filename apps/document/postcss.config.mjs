import process from 'node:process'

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    ...(!process.env.DEV ? { cssnano: {} } : {}),
  },
}
