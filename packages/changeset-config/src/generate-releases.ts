import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import process from 'node:process'
import { Octokit } from '@octokit/core'
import semver from 'semver'
import { type Package, getPackages } from '@manypkg/get-packages'
import {
  PKG_PREFIX,
  PROJECT_CHANGELOG_FILE,
  REPO_NAME,
  REPO_OWNER,
} from '@unconfig/meta'

// Create release on github
async function createRelease(
  octokit: InstanceType<typeof Octokit>,
  {
    pkg,
    tagName,
    repoName,
    repoOwner,
    projectChangelogPath,
  }: {
    tagName: string
    pkg: Package
    repoName: string
    repoOwner: string
    projectChangelogPath: string
  },
) {
  const changelogPath = resolve(pkg.dir, projectChangelogPath)
  const changelog = readFileSync(changelogPath, 'utf8')
  const changelogArr = changelog.split('\n')
  const releaseNotes: string[] = []
  // Get release notes from changelog
  for (const line of changelogArr) {
    if (/^#{3}\s/.test(line)) releaseNotes.push(line)
    else if (/^#{1,3}\s/.test(line) && releaseNotes.length > 0) break
    else if (releaseNotes.length > 0) releaseNotes.push(line)
  }

  // Check if it's a prerelease
  const prereleaseParts =
    semver.prerelease(tagName.replace(`${pkg.packageJson.name}@`, '')) || []

  // Create release on github
  try {
    const params = {
      owner: repoOwner,
      repo: repoName,
      name: tagName,
      tag_name: tagName,
      body: releaseNotes.join('\n'),
      prerelease: prereleaseParts.length > 0,
    }
    // eslint-disable-next-line no-console
    console.log(params)
    await octokit.request('POST /repos/{owner}/{repo}/releases', params)
  } catch (error: any) {
    console.warn(
      "[octokit 'POST /repos/{owner}/{repo}/releases'] has error.",
      error,
    )
  }
}

// Get only packages that have a new version published
function getReleasedPackages(
  csOutput: string,
  pkgs: Package[],
  pkgPrefix: string,
) {
  const tagNameRegex = new RegExp(
    // eslint-disable-next-line no-useless-escape
    `/New tag:\s+(${pkgPrefix}\/[^@]+)@([^\s]+)/`,
  )
  // @ts-ignore
  return csOutput.split('\n').reduce((acc, line) => {
    const match = line.match(tagNameRegex)
    if (match === null) return acc

    const tagName = [match[1], match[2]].join('@')
    const pkg = pkgs.find((p) => p.packageJson?.name === match[1])
    return [...acc, { tagName, pkg }]
  }, []) as {
    tagName: string
    pkg: Package
  }[]
}

export interface ChangesetsGenerateReleasesOptions {
  /** repositry name */
  repoName?: string
  /** repositry owner */
  repoOwner?: string
  /** package prefix */
  pkgPrefix?: string
  /** Project changelog path */
  projectChangelogPath?: string
  /** Project root path */
  cwd: string
}
// export async function changesetsGenerateReleases(
export async function changesetsGenerateReleases(
  options: ChangesetsGenerateReleasesOptions,
) {
  const {
    repoName = REPO_NAME,
    repoOwner = REPO_OWNER,
    pkgPrefix = PKG_PREFIX,
    projectChangelogPath = PROJECT_CHANGELOG_FILE,
    cwd,
  } = options

  if (!cwd) return

  // use octokit connect github
  const env = process.env
  const octokit = new Octokit({
    auth: env.GITHUB_TOKEN,
  })

  // Run changesets publish first and get stdout
  const publishCommandOutput = execSync('pnpm changeset publish').toString()
  // eslint-disable-next-line no-console
  console.log(
    `
    🚀🚀🚀 Run changesets publish and get stdout. 🚀🚀🚀
    ${publishCommandOutput}
    `,
  )

  // Create release for each published package
  const { packages: pkgs } = await getPackages(cwd)
  // eslint-disable-next-line no-console
  console.log('[changeset-config/generate-releases] cwd:', cwd)
  // eslint-disable-next-line no-console
  console.log('[changeset-config/generate-releases] pkgs:', pkgs)
  const releasedPkgs = await getReleasedPackages(
    publishCommandOutput,
    pkgs,
    pkgPrefix,
  )
  // eslint-disable-next-line no-console
  console.log(
    '[changeset-config/generate-releases] releasedPkgs:',
    releasedPkgs,
  )
  for (const pkg of releasedPkgs) {
    await createRelease(octokit, {
      ...pkg,
      repoName,
      repoOwner,
      projectChangelogPath,
    })
  }
  // eslint-disable-next-line no-console
  console.log(`🚀🚀🚀 Create release for each published package. 🚀🚀🚀`)

  // Push updated packages to github with tags
  const gitPushCommand = `git pull && git add . && git diff --staged --quiet || git commit -m "docs: 📝 add changelogs for $(git rev-parse --short HEAD) [skip ci]" && git push origin ${env.GITHUB_BRANCH} --follow-tags`
  const gitPushCommandOutput = execSync(gitPushCommand).toString()
  // eslint-disable-next-line no-console
  console.log(
    `
    🚀🚀🚀 Push updated packages to github with tags. 🚀🚀🚀
    ${gitPushCommandOutput}
    `,
  )
}
