import process from 'node:process'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  splitting: true,
  cjsInterop: true,
  watch: !!process.env.DEV,
  dts: process.env.DEV
    ? false
    : {
        compilerOptions: {
          composite: false,
        },
      },
  tsconfig: '../../tsconfig.node.json',
  clean: true,
  shims: true,
  define: {
    'import.meta.DEV': JSON.stringify(!!process.env.DEV),
  },
})
