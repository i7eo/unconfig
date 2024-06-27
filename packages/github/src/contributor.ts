import process from 'node:process'
import { access, mkdir, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mapValues, uniqBy } from 'lodash-es'
import {
  type ApiResult,
  type FetchCommitsOptions,
  fetchCommits,
} from './graphql'

type ElementOf<T> = T extends (infer E)[] ? E : never
type ApiResultNodesItem = ElementOf<ApiResult['nodes']>

const __dirname = dirname(fileURLToPath(import.meta.url))
const excludeFileNames = ['.DS_Store']

function filterGuard(name: string) {
  return !excludeFileNames.includes(name)
}

async function pathExists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function getPathDirs(pathName: string) {
  const relativePath = `../../../${pathName}`
  try {
    const dirs = await readdir(resolve(__dirname, relativePath))
    return dirs.filter(filterGuard).reduce((result, cur) => {
      const temp: FetchCommitsOptions = {
        key: cur,
        path: `${pathName}/${cur}`,
      }
      result.push(temp)
      return result
    }, [] as FetchCommitsOptions[])
  } catch {
    return []
  }
}

interface ContributorInfo {
  login: string
  name: string
  email: string
  avatar: string
  count: number
}

function calcContributors(commits: ApiResult['nodes']) {
  const contributors: Record<string, ContributorInfo> = {}
  for (const { author } of commits) {
    const login = author.user?.login
    if (!login) continue

    if (!contributors[login])
      contributors[login] = {
        login,
        name: author.name,
        email: author.email,
        avatar: author.avatarUrl,
        count: 0,
      }

    contributors[login].count++
  }
  return Object.values(contributors).sort((a, b) => b.count - a.count)
}

async function getContributorsByPathInfo(pathInfo: FetchCommitsOptions) {
  let options: FetchCommitsOptions[] = [pathInfo]
  const commits: Record<string /* component name */, ApiResult['nodes']> = {}

  do {
    const results = await fetchCommits(options)

    for (const [i, result] of Object.values(results).entries()) {
      const component = options[i].key
      if (!commits[component]) commits[component] = []
      commits[component].push(...result.nodes)
    }

    options = options
      .map((option, index) => {
        const pageInfo = results[index].pageInfo
        const after = pageInfo.hasNextPage ? pageInfo.endCursor : undefined
        return { ...option, after }
      })
      .filter((option) => !!option.after)
  } while (options.length > 0)

  return mapValues(commits, (commits: ApiResultNodesItem) =>
    //@ts-ignore
    calcContributors(uniqBy(commits, 'oid')),
  ) as Record<string, any>
}

async function getContributors() {
  const apps = await getPathDirs('apps')
  const packages = await getPathDirs('packages')
  const pathInfos = [...apps, ...packages]

  let contributors: Record<string, any> = {}
  for (const pathInfo of pathInfos) {
    contributors = {
      ...contributors,
      ...(await getContributorsByPathInfo(pathInfo)),
    }
  }

  return contributors
}

async function main() {
  let contributors: Record<string, ContributorInfo[]> = {}
  const fileName = resolve(__dirname, `../dist/contributor.json`)
  const isDistExist = await pathExists(resolve(__dirname, '../dist'))

  if (!isDistExist) await mkdir(resolve(__dirname, '../dist'))

  // eslint-disable-next-line no-console
  console.log('Github Action Env:', JSON.stringify(process.env))
  if (process.env.DEV) {
    contributors = {}
  } else {
    if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is empty')
    try {
      contributors = await getContributors()
    } catch (error: any) {
      console.warn('[@unconfig/github] contributor.ts:', error)
      contributors = {}
    }
  }
  // contributors = await getContributors()

  await writeFile(fileName, JSON.stringify(contributors), 'utf8')
  // eslint-disable-next-line no-console
  console.log('[@unconfig/github] contributor.ts: Contributors generated')
}

main()
