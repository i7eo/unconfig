import assembleReleasePlan from '@changesets/assemble-release-plan'
import { read } from '@changesets/config'
import { readPreState } from '@changesets/pre'
import readChangesets from '@changesets/read'
import { getPackages } from '@manypkg/get-packages'

import type { ReleasePlan } from '@changesets/types'

type ChangesetsPackages = Parameters<typeof assembleReleasePlan>[1]
type ManypkgPackages = Awaited<ReturnType<typeof getPackages>>

function withChangesetsRootPackage(packages: ManypkgPackages) {
  if (!packages.rootPackage) {
    throw new Error('Unable to find root package for changesets release plan.')
  }

  return {
    ...packages,
    root: packages.rootPackage,
  }
}

export async function readChangesetsReleasePlan(
  cwd: string,
): Promise<ReleasePlan> {
  const packages = withChangesetsRootPackage(await getPackages(cwd))
  const changesetsPackages = packages as unknown as ChangesetsPackages
  const preState = await readPreState(cwd)
  const config = await read(cwd, changesetsPackages)
  const changesets = await readChangesets(cwd)

  return assembleReleasePlan(changesets, changesetsPackages, config, preState)
}
