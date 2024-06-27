import { readFileSync, writeFileSync } from 'node:fs'
import prettier, { type Options } from 'prettier'
import {
  PROJECT_CHANGELOG_FILE,
  PROJECT_CHANGELOG_TEMP_FILE,
  PROJECT_WEBSITE_CHANGELOG_FILE,
} from '@unconfig/meta'

export interface ChangesetsChangelogWriteOptions {
  /** Project changelog path */
  projectChangelogPath?: string
  /** Project changelog temp path */
  projectChangelogTempPath?: string
  /** Project website changelog path */
  websiteChangelogPath?: string
  /** Project root path */
  cwd: string
  /** Changelog prettier config */
  prettierConfig?: Options
}

function getCurrentDate() {
  const date = new Date()
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return [
    `## ${day}-${month}-${year}`,
    '\n\n',
    `### ${new Date().toLocaleTimeString()}`,
  ].join('')
}

async function getContent(releases: any, prettierConfig: Options) {
  const releaseEntries = Object.entries(releases).map((release) => {
    const [displayName, changesets] = release as any
    return [displayName, '\n\n', ...changesets].join('')
  })

  let content = [getCurrentDate(), ...releaseEntries].join('\n') as string

  content = await prettier.format(content, prettierConfig)

  return content
}

export async function changesetsChangelogWrite(
  options: ChangesetsChangelogWriteOptions,
) {
  const {
    projectChangelogPath = PROJECT_CHANGELOG_FILE,
    projectChangelogTempPath = PROJECT_CHANGELOG_TEMP_FILE,
    websiteChangelogPath = PROJECT_WEBSITE_CHANGELOG_FILE,
    cwd,
    prettierConfig = {
      parser: 'markdown',
      singleQuote: true,
      trailingComma: 'es5',
    },
  } = options

  if (!cwd) return

  // check temp(rc) file content
  const releases = JSON.parse(
    readFileSync(`${cwd}/${projectChangelogTempPath}`).toString(),
  )
  if (!Object.entries(releases).length) return

  // wrapper origin changelog, create new project changelog file
  const content = await getContent(releases, prettierConfig)
  const changelog = readFileSync(`${cwd}/${projectChangelogPath}`, 'utf8')
  const newChangelog = changelog.replace(
    '<!-- CHANGELOG:INSERT -->',
    `<!-- CHANGELOG:INSERT -->\n\n${content}`,
  )

  // write project changelog file
  writeFileSync(`${cwd}/${projectChangelogPath}`, newChangelog)

  // Write changelog to website changelog file
  writeFileSync(
    `${cwd}/${websiteChangelogPath}`,
    newChangelog.replace('<!-- CHANGELOG:INSERT -->\n\n', ''),
  )

  // clean temp(rc) file
  writeFileSync(`${cwd}/${projectChangelogTempPath}`, '{}')
}
