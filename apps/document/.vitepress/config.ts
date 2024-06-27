import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { generateSitemap as sitemap } from 'sitemap-ts'
import {
  DEPLOY_DOCUMENT_URL,
  GIT_BLOG_URL,
  GIT_DOCUMENT_PROJECT_URL,
  GIT_ORG_URL,
  GIT_URL,
  ORG_ZHCN_NAME,
  REPO_OWNER,
} from '@unconfig/meta'
import { author, description, name } from '../package.json'
import { feedBuilder } from './plugins/feed'
import { pwa } from './plugins/pwa'
import { PluginMarkdown } from './plugins/markdown'
import { sidebar } from './sidebar'
// import { algolia } from './algolia'
import { getPackageKeywords } from './keywords'

// https://vitepress.dev/reference/site-config
export default withPwa(async () => {
  const keywords = await getPackageKeywords()
  return defineConfig({
    pwa,
    outDir: './dist',
    title: name,
    description,
    appearance: 'dark',
    lastUpdated: true,
    useWebFonts: false,
    markdown: {
      lineNumbers: true,
    },
    locales: {
      root: { label: '简体中文', lang: 'zh-CN' },
    },
    themeConfig: {
      logo: './logo.svg',
      outline: 'deep',
      docFooter: {
        prev: '上一篇',
        next: '下一篇',
      },
      returnToTopLabel: '返回顶部',
      outlineTitle: '导航栏',
      darkModeSwitchLabel: '外观',
      sidebarMenuLabel: '归档',
      editLink: {
        pattern: GIT_DOCUMENT_PROJECT_URL,
        text: '在 Github 上编辑此页',
      },
      lastUpdatedText: '最后一次更新于',
      footer: {
        copyright: `<a target="_blank" href="${GIT_BLOG_URL}">${ORG_ZHCN_NAME}</a> | Copyright © 2023-preset\nPowered by <a target="_blank" href="${GIT_ORG_URL}">${REPO_OWNER}</a>`,
      },
      nav: [
        {
          text: '文档',
          items: [
            { text: '📖 指南', link: '/guides/' },
            { text: '💻 示例', link: '/examples/' },
          ],
        },
        {
          text: '关于',
          items: [
            // { text: '❓ 常见问题', link: '/questions/' },
            // { text: '🧱 团队', link: '/team/' },
            { text: '🎉 更新日志', link: '/content/changelog' },
            // { text: '⌛️ 未来计划', link: '/content/todo' },
          ],
        },
      ],
      // // algolia搜索
      // search: {
      //   provider: 'algolia',
      //   options: algolia,
      // },
      sidebar,
      socialLinks: [
        {
          icon: 'github',
          link: GIT_URL,
        },
        {
          icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3.5 3.25a.75.75 0 0 1 .75-.75C14.053 2.5 22 10.447 22 20.25a.75.75 0 0 1-1.5 0C20.5 11.275 13.225 4 4.25 4a.75.75 0 0 1-.75-.75Zm.75 6.25C10.187 9.5 15 14.313 15 20.25a.75.75 0 0 1-1.5 0A9.25 9.25 0 0 0 4.25 11a.75.75 0 0 1 0-1.5ZM3.5 19a2 2 0 1 1 3.999-.001A2 2 0 0 1 3.5 19Z"/></svg>',
          },
          link: '/feed.xml',
        },
      ],
    },
    head: [
      ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }],
      ['meta', { name: 'keywords', content: keywords.join(', ') }],
      ['meta', { name: 'author', content: author }],
      ['meta', { property: 'og:type', content: 'article' }],
      ['meta', { name: 'application-name', content: name }],
      ['meta', { name: 'apple-mobile-web-app-title', content: name }],
      [
        'meta',
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],

      ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
      ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      ['link', { rel: 'mask-icon', href: '/logo.svg' }],
      ['meta', { name: 'theme-color', content: '#06f' }],

      [
        'link',
        {
          rel: 'apple-touch-icon',
          sizes: '120x120',
          href: '/images/icons/apple-touch-icon.png',
        },
      ],

      // webfont
      ['link', { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }],
      ['link', { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }],
      [
        'link',
        {
          rel: 'preconnect',
          crossorigin: 'anonymous',
          href: 'https://fonts.googleapis.com',
        },
      ],
      [
        'link',
        {
          rel: 'preconnect',
          crossorigin: 'anonymous',
          href: 'https://fonts.gstatic.com',
        },
      ],
      // og
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: DEPLOY_DOCUMENT_URL }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ],
    async buildEnd(siteConfig: any) {
      await sitemap({ hostname: DEPLOY_DOCUMENT_URL })
      await feedBuilder(siteConfig)
    },
    vite: {
      plugins: [
        // custom
        PluginMarkdown(),
      ],
    },
  })
})
