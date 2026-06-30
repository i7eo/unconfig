import { readFileSync, writeFileSync } from 'node:fs'
import { normalizeMarkdownSpacing } from './markdown'

const CHANGELOG_INSERT_MARKER = '<!-- CHANGELOG:INSERT -->'

export interface WriteProjectChangelogOptions {
  cwd: string
  content: string
  projectChangelogPath: string
  websiteChangelogPath: string
}

function assertRequiredChangelogPaths({
  projectChangelogPath,
  websiteChangelogPath,
}: Pick<
  Partial<WriteProjectChangelogOptions>,
  'projectChangelogPath' | 'websiteChangelogPath'
>) {
  const missing = [
    !projectChangelogPath && 'projectChangelogPath',
    !websiteChangelogPath && 'websiteChangelogPath',
  ].filter(Boolean)

  if (missing.length === 0) return

  throw new Error(
    `${missing.join(' and ')} ${missing.length === 1 ? 'is' : 'are'} required.`,
  )
}

function getCurrentDateHeading() {
  const date = new Date()
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return `## ${year}-${month}-${day}`
}

function insertChangelogSection(changelog: string, content: string) {
  const currentDateHeading = getCurrentDateHeading()
  const releaseContent = content.trim()
  const currentDateHeadingPattern = new RegExp(
    `(^|\\n)${currentDateHeading.replaceAll('-', '\\-')}\\n`,
  )
  const currentDateHeadingMatch = currentDateHeadingPattern.exec(changelog)

  if (
    !currentDateHeadingMatch ||
    typeof currentDateHeadingMatch.index !== 'number'
  ) {
    const section = normalizeMarkdownSpacing(
      [currentDateHeading, '', releaseContent].join('\n'),
    )

    return changelog.replace(
      CHANGELOG_INSERT_MARKER,
      `${CHANGELOG_INSERT_MARKER}\n\n${section.trim()}`,
    )
  }

  const insertIndex =
    currentDateHeadingMatch.index + currentDateHeadingMatch[0].length
  const previousContent = changelog.slice(0, insertIndex)
  const nextContent = changelog.slice(insertIndex).trimStart()
  const sectionContent = normalizeMarkdownSpacing(
    [releaseContent, '', nextContent].join('\n'),
  )

  return `${previousContent}\n${sectionContent.trim()}\n`
}

export function writeProjectChangelog(options: WriteProjectChangelogOptions) {
  const { cwd, content, projectChangelogPath, websiteChangelogPath } = options

  assertRequiredChangelogPaths({
    projectChangelogPath,
    websiteChangelogPath,
  })

  if (!content.trim()) return false

  const changelogPath = `${cwd}/${projectChangelogPath}`
  const changelog = readFileSync(changelogPath, 'utf8')

  if (!changelog.includes(CHANGELOG_INSERT_MARKER)) {
    throw new Error(
      `Unable to find ${CHANGELOG_INSERT_MARKER} in ${projectChangelogPath}.`,
    )
  }

  const nextChangelog = insertChangelogSection(changelog, content)

  writeFileSync(changelogPath, nextChangelog)
  writeFileSync(
    `${cwd}/${websiteChangelogPath}`,
    nextChangelog.replace(`${CHANGELOG_INSERT_MARKER}\n\n`, ''),
  )

  return true
}

export const changesetsChangelogWrite = writeProjectChangelog
