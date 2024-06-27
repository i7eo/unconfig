import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { exec } from 'node:child_process'
import inquirer from 'inquirer'
import semver from 'semver'
import { getPackages } from '@manypkg/get-packages'
import {
  NPM_REGISTRY_URL,
  PROJECT_CHANGESETS_CONFIG_FILE,
} from '@unconfig/meta'

function updatePackageJson(pkgJsonPath: string, version: string | null) {
  const pkgRaw = readFileSync(pkgJsonPath, { encoding: 'utf-8' })
  const stringified = pkgRaw.replace(
    /("version".*?) (".*?")/i,
    `$1 "${version}"`,
  )
  writeFileSync(pkgJsonPath, stringified)
}

async function ignorePackage(
  pkgName: string,
  cwd: string,
  projectChangesetsPath: string,
) {
  const changesetConfigPath = resolve(cwd, projectChangesetsPath)
  const rawConfig = readFileSync(changesetConfigPath, {
    encoding: 'utf-8',
  })
  const jsonConfig = JSON.parse(rawConfig)
  const ignorePkgs = jsonConfig.ignore || []
  if (!ignorePkgs.includes(pkgName)) {
    jsonConfig.ignore = [pkgName, ...ignorePkgs]
    const stringified = JSON.stringify(jsonConfig, null, 2)
    await writeFileSync(changesetConfigPath, stringified, { encoding: 'utf-8' })
  }
}

export interface ManualGeneratePrereleasesOptions {
  /** Project npm registry url */
  npmRegistryUrl?: string
  /** Project changesets path */
  projectChangesetsPath?: string
  /** Project root path */
  cwd: string
}
export async function manualGeneratePrereleases(
  options: ManualGeneratePrereleasesOptions,
) {
  const {
    npmRegistryUrl = NPM_REGISTRY_URL,
    projectChangesetsPath = PROJECT_CHANGESETS_CONFIG_FILE,
    cwd,
  } = options

  if (!cwd) return

  // create inquire prompt and get user choose package
  const { packages } = await getPackages(cwd)
  const choices = packages
    .map(({ packageJson }) => ({
      name: `${packageJson.name} (${packageJson.version})`,
      value: packageJson.name,
    }))
    // @ts-ignore
    .concat(new inquirer.Separator())
  const { pkgName } = await inquirer.prompt([
    {
      pageSize: 12,
      name: 'pkgName',
      message: 'Which package to make a pre-release?',
      type: 'list',
      choices,
    },
  ])

  // use user choosed package to create prerelease tag prompt
  const { packageJson, dir } = packages.find(
    ({ packageJson }) => packageJson.name === pkgName,
  )!
  const { version, name } = packageJson
  const prereleaseTag = semver.prerelease(version)?.[0]
  const { tag, publish } = await inquirer.prompt([
    {
      name: 'tag',
      message: 'Which tag should be used for the pre-release?',
      type: 'list',
      choices: [
        {
          name: 'alpha',
        },
        {
          name: 'beta',
        },
      ],
      default: prereleaseTag,
    },
    {
      name: 'publish',
      message: 'Should the package be published?',
      type: 'confirm',
    },
  ])

  // manual update package.json
  const increase = prereleaseTag === tag ? 'prerelease' : 'preminor'
  const newVersion = semver.inc(version, increase, tag)
  await updatePackageJson(resolve(dir, 'package.json'), newVersion)
  // Avoid chageset publishing it, by adding the package to the ignore list
  await ignorePackage(name, cwd, projectChangesetsPath)

  if (publish) {
    await exec(`npm publish ${dir} --tag ${tag}`, (error, stdout, stderr) => {
      if (!error) {
        // eslint-disable-next-line no-console
        console.log(stdout)
        // eslint-disable-next-line no-console
        console.log(
          `${name}@${newVersion} published: \n${npmRegistryUrl}/${name}\n`,
        )
      } else {
        console.error(error)
        console.error(stderr)
      }
    })
  } else {
    // eslint-disable-next-line no-console
    console.log(`Version for ${name} updated on package.json.`)
  }
}
