import {
  formatProjectChangelogSection,
  normalizeChangesetSummary,
} from './markdown'
import { readChangesetsReleasePlan } from './release-plan'

export interface GenerateProjectChangelogOptions {
  cwd: string
  packages?: string[]
  ignorePackages?: string[]
}

export interface GenerateProjectChangelogFromReleasePlanOptions {
  packages?: string[]
  ignorePackages?: string[]
}

export interface ProjectChangesetSummary {
  id: string
  summary: string
}

export interface ProjectReleaseSummary {
  name: string
  newVersion: string
  changesets: string[]
}

export interface ProjectReleasePlan {
  changesets: ProjectChangesetSummary[]
  releases: ProjectReleaseSummary[]
}

export function generateProjectChangelogFromReleasePlan(
  releasePlan: ProjectReleasePlan,
  options: GenerateProjectChangelogFromReleasePlanOptions = {},
): string {
  const { packages = [], ignorePackages = [] } = options

  const entries = releasePlan.releases
    .filter((release) => release.changesets.length > 0)
    .filter((release) => !ignorePackages.includes(release.name))
    .map((release) => ({
      name: release.name,
      displayName: `**${release.name}** \`v${release.newVersion}\``,
      changes: release.changesets
        .map((changesetId) => {
          const changeset = releasePlan.changesets.find(
            (item) => item.id === changesetId,
          )
          return normalizeChangesetSummary(changeset?.summary ?? '')
        })
        .filter(Boolean),
    }))
    .sort((a, b) => {
      const aIndex = packages.indexOf(a.name)
      const bIndex = packages.indexOf(b.name)

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1

      return a.name.localeCompare(b.name)
    })

  if (!entries.length) return ''

  return formatProjectChangelogSection(entries)
}

export async function generateProjectChangelog(
  options: GenerateProjectChangelogOptions,
): Promise<string> {
  const { cwd, packages, ignorePackages } = options
  const releasePlan = await readChangesetsReleasePlan(cwd)

  return generateProjectChangelogFromReleasePlan(releasePlan, {
    packages,
    ignorePackages,
  })
}

export { normalizeChangesetSummary }
export const changesetsChangelogGenerate = generateProjectChangelog
