import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type Alias, defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import PluginComponents from 'unplugin-vue-components/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

const alias: Alias[] = [
  {
    find: '~/',
    replacement: `${resolve(__dirname, './.vitepress')}/`,
  },
]

export default defineConfig(() => {
  return {
    resolve: {
      alias,
    },
    server: {
      port: 10001,
      // fs: {
      //   allow: [resolve(__dirname, '..')],
      // },
    },
    preview: {
      port: 10002,
    },
    plugins: [
      PluginComponents({
        dirs: resolve(__dirname, '.vitepress/theme/components'),
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        // resolvers: [
        //   IconsResolver({
        //     componentPrefix: '',
        //   }),
        // ],
        dts: './.vitepress/theme/components.d.ts',
        transformer: 'vue3',
      }),
      Inspect(),
    ],
    // css: {
    //   postcss: {
    //     plugins: [require('postcss-nested')],
    //   },
    // },

    // // see: https://github.com/vuejs/vitepress/issues/3872
    // ssr: {
    //   noExternal: ['@gitbeaker/rest'],
    // },
  }
})
