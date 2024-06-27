import process from 'node:process'
import { Octokit } from '@octokit/core'
import { REPO_BRANCH, REPO_NAME, REPO_OWNER } from '@unconfig/meta'

export const githubApi: InstanceType<typeof Octokit> = new Octokit({
  auth: process.env.TOKEN,
})

export const GITHUB_DEFAULT_NAMES = ['i7eo']

export const GITHUB_DEFAULT_EXCLUDE_NAMES = [
  'devops',
  'bot',
  'web-flow',
  'renovate[bot]',
]

export interface ApiResult {
  pageInfo: {
    hasNextPage: boolean
    endCursor: string
  }
  nodes: Array<{
    oid: string
    author: {
      avatarUrl: string
      date: string
      email: string
      name: string
      user?: {
        login: string
      }
    }
  }>
}

export interface ApiResponse {
  repository: {
    object: Record<`path${number}`, ApiResult>
  }
}

export interface FetchCommitsOptions {
  key: string
  path: string
  after?: string
}
export async function fetchCommits(
  options: FetchCommitsOptions[],
): Promise<Record<string, ApiResult>> {
  const query = `{
    repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
      object(expression: "${REPO_BRANCH}") {
        ... on Commit {
          ${options
            .map(({ path, after }, index) => {
              return `
              path${index}: history(path: "${path}"${
                after ? `, after: "${after}"` : ''
              }) {
                nodes {
                  oid
                  author {
                    avatarUrl
                    date
                    email
                    name
                    user {
                      login
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }`
            })
            .join('\n')}
        }
      }
    }
  }`
  const response = (await githubApi.graphql<ApiResponse>(query)).repository
    .object
  return Object.fromEntries(
    Object.entries(response).map(([key, result]) => {
      const index = +key.replace('path', '')
      return [index, result]
    }),
  ) as Record<string, ApiResult>
}
