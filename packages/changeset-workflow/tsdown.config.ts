import process from 'node:process'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'node',
  watch: !!process.env.DEV,
  dts: true,
  tsconfig: './tsconfig.json',
  clean: true,
  shims: true,
  define: {
    'import.meta.DEV': JSON.stringify(!!process.env.DEV),
  },
})
