import process from 'node:process'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  // splitting: true, // 暂时不要开启，对某些 cjs module 支持度不够比如 prettier
  cjsInterop: true,
  // watch: !!process.env.DEV,
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
