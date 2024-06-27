import { readFileSync, writeFileSync } from 'node:fs'
import assembleReleasePlan from '@changesets/assemble-release-plan'
import { read } from '@changesets/config'
import { readPreState } from '@changesets/pre'
import readChangesets from '@changesets/read'
import { getPackages } from '@manypkg/get-packages'
import { PROJECT_CHANGELOG_TEMP_FILE } from '@unconfig/meta'
// import {
//   defaultOptions,
//   getReleaseLine,
// } from './format-with-issue-links'
import type { ComprehensiveRelease, NewChangeset } from '@changesets/types'

export interface ChangesetsChangelogGenerateOptions {
  /** Packages we want to have on changelog */
  packages: string[]
  /** Packages we don't want to have on changelog */
  ignorePackages?: string[]
  /** Project root path */
  cwd: string
  /** Project changelog temp path */
  projectChangelogTempPath?: string
}

// Umbrella packages
// const componentsPkg = `${PKG_PREFIX}/ui`

// // Format package names as Start Case
// function startCase(string: string) {
//   const toStartCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
//   return string
//     .split(/\W/g)
//     .reduce((str: string, x: any) => `${str.trim()} ${toStartCase(x)}`, '')
//     .trim()
// }

// function getPackageName(name: string) {
//   return startCase(name.replace(`${PKG_PREFIX}/`, ''))
// }

// Formats displayName for each release and separate changesets
function getReleaseSummary(
  changesets: NewChangeset[],
  release: ComprehensiveRelease,
) {
  // TODO: TEST GIT-LOG PKG
  // for (let idx = 0; idx < changesets.length - 1; idx++) {
  //   const changeset = changesets[idx]
  //   const commitInfo = await getReleaseLine(changeset, release.type, {
  //     ...defaultOptions,
  //     repoBaseUrl: 'http://192.168.10.23/xiopmh-fe/unconfig',
  //   })
  //   console.log(commitInfo)
  // }

  const formattedChangesets = release.changesets.map((changeset) => {
    const { summary = '' } = changesets.find((cs) => cs.id === changeset) ?? {}
    const changes = summary.split('\n')
    return changes
      .map((change: string) =>
        !change || change?.trim().startsWith('-') ? change : `- ${change}\n`,
      )
      .join('')
  })

  // const subPackageName = `**${getPackageName(release.name)}** \`v${
  //   release.newVersion
  // }\``
  // const rootPackageName = `\`${componentsPkg}@${release.newVersion}\``
  // const displayName =
  //   release.name === componentsPkg ? rootPackageName : subPackageName

  const displayName = `**${release.name}** \`v${release.newVersion}\``

  return {
    ...release,
    changesets: formattedChangesets,
    displayName: displayName.replace(/,\s*$/, ''),
  }
}

// Get changes from changesets and returns the releases with displayName and the changes grouped
async function getChangesetEntries(
  options: Required<
    Omit<ChangesetsChangelogGenerateOptions, 'projectChangelogTempPath'>
  >,
) {
  const {
    packages: changelogPackges,
    ignorePackages: ignoreChangelogPackages,
    cwd,
  } = options
  const packages = await getPackages(cwd)
  const preState = await readPreState(cwd)
  const config = await read(cwd, packages)
  const changesets = await readChangesets(cwd)

  const releasePlan = assembleReleasePlan(
    changesets,
    packages,
    config,
    preState,
  )

  const releases = releasePlan.releases
    .filter((release) => release.changesets.length > 0) // Remove releases without changesets
    .filter((release) => !ignoreChangelogPackages.includes(release.name)) // Remove ignored packages
    .map((release) => getReleaseSummary(releasePlan.changesets, release))
    .sort((a, b) => {
      // Sort umbrella package at the top, and others alphabetically
      // if (a.name === componentsPkg) return -1
      // if (b.name === componentsPkg) return 1
      if (changelogPackges.includes(a.name)) return -1
      if (changelogPackges.includes(b.name)) return 1
      return a.name < b.name ? -1 : 1
    })

  return releases
}

export async function changesetsChangelogGenerate(
  options: ChangesetsChangelogGenerateOptions,
) {
  const {
    packages,
    ignorePackages = [],
    cwd,
    projectChangelogTempPath = PROJECT_CHANGELOG_TEMP_FILE,
  } = options

  if (!cwd) return

  const releases = await getChangesetEntries({
    packages,
    ignorePackages,
    cwd,
  })
  if (!releases.length) return

  const content =
    JSON.parse(readFileSync(`${cwd}/${projectChangelogTempPath}`).toString()) ||
    {}

  releases.forEach(({ displayName, changesets }) => {
    const prevState = content[displayName] || []
    content[displayName] = [...new Set([...prevState, ...changesets])]
  })

  // write to temp(rc) file
  writeFileSync(`${cwd}/${projectChangelogTempPath}`, JSON.stringify(content))
}
