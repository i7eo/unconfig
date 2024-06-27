import path from 'node:path'
import { writeFileSync } from 'node:fs'
import { Feed } from 'feed'
import { type SiteConfig, createContentLoader } from 'vitepress'
import {
  DEPLOY_DOCUMENT_URL,
  GIT_HOST,
  ORG_ZHCN_NAME,
  REPO_OWNER,
} from '@unconfig/meta'
import { description, name } from '../../package.json'

function getGithubLink(name: string = 'i7eo') {
  return `http://${GIT_HOST}/${name}`
}

export async function feedBuilder(config: SiteConfig) {
  const feed = new Feed({
    title: name,
    description,
    id: DEPLOY_DOCUMENT_URL,
    link: DEPLOY_DOCUMENT_URL,
    language: 'zh-CN',
    image: `${DEPLOY_DOCUMENT_URL}/logo.svg`,
    favicon: `${DEPLOY_DOCUMENT_URL}/favicon.ico`,
    copyright: `${ORG_ZHCN_NAME} | Copyright © 2023-preset}\nPowered by ${REPO_OWNER}`,
  })

  const posts = await createContentLoader('**/*.md', {
    excerpt: true,
    render: true,
  }).load()

  posts.sort(
    (a: any, b: any) =>
      +new Date(b.frontmatter?.date as string) -
      +new Date(a.frontmatter?.date as string),
  )

  for (const { url, frontmatter, html } of posts) {
    let postTitle = '无题'
    postTitle = html?.match(/<h1 id=(.*)>(.*?)<a .*?>/)?.[2] || postTitle
    feed.addItem({
      title: frontmatter?.title || postTitle,
      id: `${DEPLOY_DOCUMENT_URL}${url.slice(1)}`,
      link: `${DEPLOY_DOCUMENT_URL}${url.slice(1)}`,
      guid: `${DEPLOY_DOCUMENT_URL}${url.slice(1)}`,
      description: html,
      content: html,
      author: [
        {
          name: frontmatter?.author,
          link: frontmatter?.author
            ? getGithubLink(frontmatter?.author)
            : undefined,
        },
      ],
      date: frontmatter?.date || new Date('2023-07-04'),
    })
  }

  writeFileSync(path.join(config.outDir, 'feed.xml'), feed.rss2())
}
