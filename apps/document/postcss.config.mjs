import process from 'node:process'

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(!process.env.DEV ? { cssnano: {} } : {}),
  },
}
