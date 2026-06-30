import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const packageJsonPath = resolve(import.meta.dirname, '../package.json')

async function readPackageJson() {
  return JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
    exports?: Record<string, unknown>
    publishConfig?: {
      exports?: Record<string, unknown>
    }
    scripts?: Record<string, string>
  }
}

describe('@unconfig/github package metadata', () => {
  it('exposes the generated contributor data subpath used by the docs app', async () => {
    const packageJson = await readPackageJson()

    expect(packageJson.exports).toHaveProperty(
      './contributor.json',
      './dist/contributor.json',
    )
    expect(packageJson.publishConfig?.exports).toHaveProperty(
      './contributor.json',
      './dist/contributor.json',
    )
  })

  it('keeps generated contributor data available without requiring a shell-expanded token', async () => {
    const packageJson = await readPackageJson()

    expect(packageJson.scripts?.build).toBe('tsdown && pnpm build:contributor')
    expect(packageJson.scripts?.['build:contributor']).toBe(
      'tsx ./src/contributor.ts',
    )
  })
})
