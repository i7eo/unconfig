import {
  type EnhanceAppContext,
  type Theme,
  inBrowser,
  useRoute,
} from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, onMounted, watch } from 'vue'
import mediumZoom from 'medium-zoom'
import './styles/css-vars.css'
import './styles/base.css'
import './styles/tailwind.css'

if (inBrowser) import('../plugins/pwa-register')

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ router }: EnhanceAppContext) {
    if (inBrowser) {
      window.addEventListener('hashchange', () => {
        const { href: url } = window.location
        // eslint-disable-next-line no-console
        console.log('vitepress has change:', url)
      })

      router.onAfterRouteChanged = (to) => {
        // eslint-disable-next-line no-console
        console.log('vitepress after route change:', to)
      }
    }
  },
  setup() {
    const route = useRoute()

    function initZoom(selector?: string) {
      mediumZoom(selector ?? '.main img', { background: 'var(--vp-c-bg)' })
    }

    onMounted(() => {
      initZoom()
    })

    watch(
      () => route.path,
      () => nextTick(() => initZoom()),
    )
  },
}

export default theme
