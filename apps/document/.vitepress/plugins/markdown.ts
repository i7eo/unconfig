import { getReadingTime } from './../theme/utils'
import type { Plugin } from 'vite'

const IGNORE_PAGEINFO_PLACEHOLDER = '<!-- ignore-page-info -->'
const IGNORE_CONTRIBUTOR_PLACEHOLDER = '<!-- ignore-contributor -->'

function replacer(
  code: string,
  value: string,
  key: string,
  insert: 'head' | 'tail' | 'none' = 'none',
) {
  const START = `<!--${key}_STARTS-->`
  const END = `<!--${key}_ENDS-->`
  const regex = new RegExp(`${START}[\\s\\S]*?${END}`, 'im')

  const target = value ? `${START}\n${value}\n${END}` : `${START}${END}`

  // eslint-disable-next-line unicorn/prefer-regexp-test
  if (!code.match(regex)) {
    if (insert === 'none') return code
    else if (insert === 'head') return `${target}\n${code}`
    else return `${code}\n${target}`
  }

  return code.replace(regex, target)
}

function getMarkdownPlaceholder() {
  const ContributorsSection = `<PackageContributor/>`

  const footer = `${ContributorsSection}`

  return {
    footer,
  }
}

export function PluginMarkdown(): Plugin {
  return {
    name: `document-vitepress-plugin-markdown`,
    enforce: 'pre',
    transform(code, id) {
      if (!/\.md\b/.test(id)) return null

      if (!code.includes(IGNORE_CONTRIBUTOR_PLACEHOLDER)) {
        const { footer } = getMarkdownPlaceholder()
        code = replacer(code, footer, 'FOOTER', 'tail')
      }

      if (!code.includes(IGNORE_PAGEINFO_PLACEHOLDER)) {
        const { readTime, words } = getReadingTime(code)
        code = code.replace(
          /(#\s.+?\n)/,
          `$1\n<PageInfo readTime="${readTime}" words="${words}"/>\n`,
        )
      }

      return code
    },
  }
}
