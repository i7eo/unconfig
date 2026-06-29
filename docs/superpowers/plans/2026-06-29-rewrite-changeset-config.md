# Rewrite Changeset Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `@unconfig/changeset-config` so it maximally reuses official changesets behavior and only keeps `unconfig`-specific changelog aggregation and documentation synchronization.

**Architecture:** Changesets remains the source of truth for version calculation, package changelog generation, publishing, tags, and GitHub releases. This package becomes a thin adapter around `@changesets/*` APIs that reads the current release plan, converts it into a project-level changelog section, and writes that section to `CHANGELOG.md` plus the VitePress changelog page. Publishing and GitHub release creation move to `@changesets/action` or the standard `changeset publish` flow.

**Tech Stack:** TypeScript, tsup, Vitest, `@changesets/assemble-release-plan`, `@changesets/config`, `@changesets/read`, `@changesets/pre`, `@manypkg/get-packages`, Prettier.

---

## File Structure

- Modify `packages/changeset-config/src/changelog-generate.ts`
  - Replace temp-file mutation with a pure release-plan summary generator.
  - Keep changesets APIs as the only source of package/version/change data.
- Modify `packages/changeset-config/src/changelog-write.ts`
  - Accept generated markdown directly and write project/document changelogs.
  - Keep marker insertion and website mirroring.
- Delete or deprecate `packages/changeset-config/src/generate-releases.ts`
  - Stop shelling out to `pnpm changeset publish`, `git add .`, and GitHub REST release creation.
  - Delegate publish/GitHub release creation to `@changesets/action`.
- Delete or deprecate `packages/changeset-config/src/manual-generate-prereleases.ts`
  - Prefer official `changeset pre enter <tag>`, `changeset pre exit`, or snapshot releases.
- Modify `packages/changeset-config/src/index.ts`
  - Export only the small public API.
- Create `packages/changeset-config/src/release-plan.ts`
  - Shared helper that reads packages/config/pre-state/changesets and returns a changesets release plan.
- Create `packages/changeset-config/src/markdown.ts`
  - Small formatting helpers for project-level markdown.
- Create `packages/changeset-config/src/__tests__/release-plan.test.ts`
  - Unit test pure filtering/sorting/formatting behavior with fixture-like objects.
- Create `packages/changeset-config/src/__tests__/changelog-write.test.ts`
  - Test marker insertion and website changelog output in a temporary directory.
- Modify `scripts/changesets/changelog-generate.cts`
  - Generate project changelog markdown using the new API.
- Modify `scripts/changesets/changelog-write.cts`
  - Either remove this script or make it call the new combined writer.
- Modify `scripts/changesets/generate-releases.cts`
  - Remove after root scripts are updated.
- Modify `scripts/changesets/manual-generate-prereleases.cts`
  - Remove after root scripts are updated.
- Modify `package.json`
  - Replace custom publish script with official changesets commands and a docs-only post-version step.
- Modify `.github/workflows/release.yml`
  - Add or update workflow to use `changesets/action` with `createGithubReleases: true`.
- Modify `packages/changeset-config/README.md`
  - Document the narrower responsibility and explain the official changesets pieces it intentionally delegates.

---

### Task 1: Define the New Public Boundary

**Files:**

- Modify: `packages/changeset-config/src/index.ts`
- Create: `packages/changeset-config/src/release-plan.ts`

- [ ] **Step 1: Add release-plan helper**

Create `packages/changeset-config/src/release-plan.ts`:

```ts
import assembleReleasePlan from '@changesets/assemble-release-plan'
import { read } from '@changesets/config'
import { readPreState } from '@changesets/pre'
import readChangesets from '@changesets/read'
import { getPackages } from '@manypkg/get-packages'

import type { ReleasePlan } from '@changesets/types'

type ChangesetsPackages = Parameters<typeof assembleReleasePlan>[1]

function toChangesetsPackages(
  packages: Awaited<ReturnType<typeof getPackages>>,
): ChangesetsPackages {
  if (!packages.rootPackage) {
    throw new Error('Unable to find root package for changesets release plan.')
  }

  return {
    tool: packages.tool.type,
    packages: packages.packages,
    root: packages.rootPackage,
  } as ChangesetsPackages
}

export async function readChangesetsReleasePlan(
  cwd: string,
): Promise<ReleasePlan> {
  const packages = toChangesetsPackages(await getPackages(cwd))
  const preState = await readPreState(cwd)
  const config = await read(cwd, packages)
  const changesets = await readChangesets(cwd)

  return assembleReleasePlan(changesets, packages, config, preState)
}
```

- [ ] **Step 2: Export only the supported API**

Replace `packages/changeset-config/src/index.ts` with:

```ts
export * from './changelog-generate'
export * from './changelog-write'
export * from './release-plan'
```

- [ ] **Step 3: Run typecheck/build**

Run:

```bash
pnpm --filter @unconfig/changeset-config build
```

Expected: build fails only because downstream modules still reference old exports, or passes if no stale exports are compiled yet.

---

### Task 2: Convert Changelog Generation into a Pure Adapter

**Files:**

- Modify: `packages/changeset-config/src/changelog-generate.ts`
- Create: `packages/changeset-config/src/markdown.ts`
- Test: `packages/changeset-config/src/__tests__/release-plan.test.ts`

- [ ] **Step 1: Add markdown formatter**

Create `packages/changeset-config/src/markdown.ts`:

```ts
import prettier, { type Options } from 'prettier'

export interface ProjectReleaseEntry {
  displayName: string
  changes: string[]
}

export function normalizeChangesetSummary(summary: string): string {
  return summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith('-') ? line : `- ${line}`))
    .join('\n')
}

export async function formatProjectChangelogSection(
  entries: ProjectReleaseEntry[],
  options: Options = { parser: 'markdown' },
): Promise<string> {
  const content = entries
    .map((entry) => [entry.displayName, '', ...entry.changes].join('\n'))
    .join('\n\n')

  return prettier.format(content, options)
}
```

- [ ] **Step 2: Rewrite changelog-generate**

Replace `packages/changeset-config/src/changelog-generate.ts` with:

```ts
import {
  formatProjectChangelogSection,
  normalizeChangesetSummary,
} from './markdown'
import { readChangesetsReleasePlan } from './release-plan'

import type { Options } from 'prettier'

export interface GenerateProjectChangelogOptions {
  cwd: string
  packages?: string[]
  ignorePackages?: string[]
  prettierConfig?: Options
}

export async function generateProjectChangelog(
  options: GenerateProjectChangelogOptions,
): Promise<string> {
  const {
    cwd,
    packages = [],
    ignorePackages = [],
    prettierConfig = { parser: 'markdown' },
  } = options

  const releasePlan = await readChangesetsReleasePlan(cwd)
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

  return formatProjectChangelogSection(entries, prettierConfig)
}

export const changesetsChangelogGenerate = generateProjectChangelog
```

- [ ] **Step 3: Add focused formatter test**

Create `packages/changeset-config/src/__tests__/release-plan.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { normalizeChangesetSummary } from '../markdown'

describe('normalizeChangesetSummary', () => {
  it('keeps markdown list lines and prefixes plain lines', () => {
    expect(normalizeChangesetSummary('Added config preset\n- Fixed docs')).toBe(
      '- Added config preset\n- Fixed docs',
    )
  })
})
```

- [ ] **Step 4: Run package tests**

Run:

```bash
pnpm --filter @unconfig/changeset-config test -- --run
```

Expected: PASS.

---

### Task 3: Make Changelog Writing Explicit and Idempotent

**Files:**

- Modify: `packages/changeset-config/src/changelog-write.ts`
- Test: `packages/changeset-config/src/__tests__/changelog-write.test.ts`

- [ ] **Step 1: Replace temp-file based writer**

Replace `packages/changeset-config/src/changelog-write.ts` with:

```ts
import { readFileSync, writeFileSync } from 'node:fs'
import prettier, { type Options } from 'prettier'
import {
  PROJECT_CHANGELOG_FILE,
  PROJECT_WEBSITE_CHANGELOG_FILE,
} from '@unconfig/meta'

const CHANGELOG_INSERT_MARKER = '<!-- CHANGELOG:INSERT -->'

export interface WriteProjectChangelogOptions {
  cwd: string
  content: string
  projectChangelogPath?: string
  websiteChangelogPath?: string
  prettierConfig?: Options
}

function getCurrentDateHeading() {
  const date = new Date()
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return `## ${day}-${month}-${year}`
}

export async function writeProjectChangelog(
  options: WriteProjectChangelogOptions,
) {
  const {
    cwd,
    content,
    projectChangelogPath = PROJECT_CHANGELOG_FILE,
    websiteChangelogPath = PROJECT_WEBSITE_CHANGELOG_FILE,
    prettierConfig = { parser: 'markdown' },
  } = options

  if (!content.trim()) return false

  const changelogPath = `${cwd}/${projectChangelogPath}`
  const changelog = readFileSync(changelogPath, 'utf8')

  if (!changelog.includes(CHANGELOG_INSERT_MARKER)) {
    throw new Error(
      `Unable to find ${CHANGELOG_INSERT_MARKER} in ${projectChangelogPath}.`,
    )
  }

  const section = await prettier.format(
    [getCurrentDateHeading(), '', content.trim()].join('\n'),
    prettierConfig,
  )
  const nextChangelog = changelog.replace(
    CHANGELOG_INSERT_MARKER,
    `${CHANGELOG_INSERT_MARKER}\n\n${section.trim()}`,
  )

  writeFileSync(changelogPath, nextChangelog)
  writeFileSync(
    `${cwd}/${websiteChangelogPath}`,
    nextChangelog.replace(`${CHANGELOG_INSERT_MARKER}\n\n`, ''),
  )

  return true
}

export const changesetsChangelogWrite = writeProjectChangelog
```

- [ ] **Step 2: Add writer test**

Create `packages/changeset-config/src/__tests__/changelog-write.test.ts`:

```ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { writeProjectChangelog } from '../changelog-write'

describe('writeProjectChangelog', () => {
  it('inserts project changelog and mirrors website changelog', async () => {
    const cwd = join(tmpdir(), `unconfig-changelog-${Date.now()}`)
    mkdirSync(join(cwd, 'apps/document/content'), { recursive: true })
    writeFileSync(
      join(cwd, 'CHANGELOG.md'),
      '# Changelog\n\n<!-- CHANGELOG:INSERT -->\n',
    )

    const didWrite = await writeProjectChangelog({
      cwd,
      content: '**@unconfig/example** `v1.0.0`\n\n- Added release docs',
      websiteChangelogPath: 'apps/document/content/changelog.md',
    })

    expect(didWrite).toBe(true)
    expect(readFileSync(join(cwd, 'CHANGELOG.md'), 'utf8')).toContain(
      '**@unconfig/example** `v1.0.0`',
    )
    expect(
      readFileSync(join(cwd, 'apps/document/content/changelog.md'), 'utf8'),
    ).not.toContain('<!-- CHANGELOG:INSERT -->')
  })
})
```

- [ ] **Step 3: Run package tests**

Run:

```bash
pnpm --filter @unconfig/changeset-config test -- --run
```

Expected: PASS.

---

### Task 4: Replace Two-Step Temp Workflow with One Script

**Files:**

- Modify: `scripts/changesets/changelog-generate.cts`
- Delete: `scripts/changesets/changelog-write.cts`
- Modify: `package.json`

- [ ] **Step 1: Rewrite changelog script**

Replace `scripts/changesets/changelog-generate.cts` with:

```ts
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import {
  generateProjectChangelog,
  writeProjectChangelog,
} from '@unconfig/changeset-config'
import { PKG_PREFIX } from '@unconfig/meta'

const cwd = process.cwd()
const excludeFileNames = ['.DS_Store', 'README.md']

function filterGuard(name: string) {
  return !excludeFileNames.includes(name)
}

const apps = readdirSync(resolve(__dirname, '../../apps'))
  .map((name) => `${PKG_PREFIX}/${name}`)
  .filter(filterGuard)

const packages = readdirSync(resolve(__dirname, '../../packages'))
  .map((name) => `${PKG_PREFIX}/${name}`)
  .filter(filterGuard)

const content = await generateProjectChangelog({
  packages,
  ignorePackages: apps,
  cwd,
})

await writeProjectChangelog({
  cwd,
  content,
})
```

- [ ] **Step 2: Remove obsolete script file**

Delete `scripts/changesets/changelog-write.cts`.

- [ ] **Step 3: Update root scripts**

In `package.json`, replace:

```json
"changelog:gen": "tsx ./scripts/changesets/changelog-generate.cts",
"changelog:write": "tsx ./scripts/changesets/changelog-write.cts",
"changeset:publish": "tsx ./scripts/changesets/generate-releases.cts $GITHUB_TOKEN $GITHUB_BRANCH"
```

with:

```json
"changelog:sync": "tsx ./scripts/changesets/changelog-generate.cts",
"changeset:version": "changeset version && pnpm changelog:sync",
"changeset:publish": "changeset publish"
```

- [ ] **Step 4: Run script smoke test**

Run:

```bash
pnpm changelog:sync
```

Expected: exits successfully. If there are no pending changesets, it should not modify changelog files.

---

### Task 5: Delegate Release Creation to Changesets Action

**Files:**

- Create or modify: `.github/workflows/release.yml`
- Delete: `scripts/changesets/generate-releases.cts`
- Modify: `packages/changeset-config/src/index.ts`
- Modify: `packages/changeset-config/package.json`

- [ ] **Step 1: Add official changesets workflow**

Create or replace `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - master

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Create release PR or publish
        uses: changesets/action@v1
        with:
          version: pnpm changeset:version
          publish: pnpm changeset:publish
          createGithubReleases: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 2: Delete custom release generator script**

Delete `scripts/changesets/generate-releases.cts`.

- [ ] **Step 3: Remove old exports**

Confirm `packages/changeset-config/src/index.ts` does not export `generate-releases`.

- [ ] **Step 4: Remove unneeded dependencies**

In `packages/changeset-config/package.json`, remove dependencies that only supported custom publishing:

```json
"@octokit/core": "^7.0.6",
"semver": "^7.8.5"
```

Keep `semver` only if Task 6 intentionally keeps prerelease tooling.

- [ ] **Step 5: Run build**

Run:

```bash
pnpm --filter @unconfig/changeset-config build
```

Expected: PASS.

---

### Task 6: Replace Manual Prerelease with Official Changesets Commands

**Files:**

- Delete: `packages/changeset-config/src/manual-generate-prereleases.ts`
- Delete: `scripts/changesets/manual-generate-prereleases.cts`
- Modify: `package.json`
- Modify: `packages/changeset-config/README.md`

- [ ] **Step 1: Delete manual prerelease source**

Delete `packages/changeset-config/src/manual-generate-prereleases.ts`.

- [ ] **Step 2: Delete manual prerelease script**

Delete `scripts/changesets/manual-generate-prereleases.cts`.

- [ ] **Step 3: Update root scripts**

In `package.json`, replace:

```json
"prerelease": "tsx ./scripts/changesets/manual-generate-prereleases.cts"
```

with:

```json
"changeset:pre:alpha": "changeset pre enter alpha",
"changeset:pre:beta": "changeset pre enter beta",
"changeset:pre:exit": "changeset pre exit",
"changeset:snapshot": "changeset version --snapshot"
```

- [ ] **Step 4: Document prerelease usage**

In `packages/changeset-config/README.md`, add:

````md
## Prereleases

This package does not implement custom prerelease publishing. Use the official changesets prerelease mode instead:

```bash
pnpm changeset:pre:alpha
pnpm changeset
pnpm changeset:version
pnpm changeset:publish
pnpm changeset:pre:exit
```
````

For temporary builds, use:

```bash
pnpm changeset:snapshot
```

````

- [ ] **Step 5: Run build**

Run:

```bash
pnpm build:packages
````

Expected: PASS.

---

### Task 7: Update README to Match the New Responsibility

**Files:**

- Modify: `packages/changeset-config/README.md`
- Modify: `apps/document/packages/changeset-config/index.md`

- [ ] **Step 1: Replace README content**

Replace `packages/changeset-config/README.md` with:

````md
# `@unconfig/changeset-config`

Project-specific changesets helpers for `unconfig`.

This package intentionally does not replace the changesets CLI. It reuses changesets for versioning, package changelog generation, publishing, tags, and GitHub releases. The only behavior implemented here is the `unconfig`-specific project changelog aggregation used by the root repository changelog and the documentation site.

## What stays in changesets

- Creating changeset files with `changeset`
- Calculating versions with `changeset version`
- Publishing packages with `changeset publish`
- Creating GitHub releases through `changesets/action`
- Prerelease mode with `changeset pre`

## What this package adds

- Reads the current changesets release plan
- Filters app packages from project changelog output
- Sorts package release entries using repository package order
- Writes the generated section to `CHANGELOG.md`
- Mirrors the root changelog to `apps/document/content/changelog.md`

## Usage

```ts
import {
  generateProjectChangelog,
  writeProjectChangelog,
} from '@unconfig/changeset-config'

const content = await generateProjectChangelog({
  cwd: process.cwd(),
  packages: ['@unconfig/eslint-config', '@unconfig/prettier-config'],
  ignorePackages: ['@unconfig/document'],
})

await writeProjectChangelog({
  cwd: process.cwd(),
  content,
})
```
````

````

- [ ] **Step 2: Mirror docs page**

Replace `apps/document/packages/changeset-config/index.md` body with the same responsibility summary, preserving frontmatter:

```md
---
packagePath: 'changeset-config'
---

# `@unconfig/changeset-config`

Project-specific changesets helpers for `unconfig`.

This package does not replace the changesets CLI. It only aggregates the changesets release plan into the root changelog and documentation changelog.
````

- [ ] **Step 3: Run docs build**

Run:

```bash
pnpm build:document
```

Expected: PASS.

---

### Task 8: Final Verification

**Files:**

- All modified files

- [ ] **Step 1: Run package tests**

Run:

```bash
pnpm --filter @unconfig/changeset-config test -- --run
```

Expected: PASS.

- [ ] **Step 2: Run package build**

Run:

```bash
pnpm --filter @unconfig/changeset-config build
```

Expected: PASS.

- [ ] **Step 3: Run workspace lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Inspect git diff**

Run:

```bash
git diff --stat
git diff -- package.json packages/changeset-config scripts/changesets .github/workflows/release.yml
```

Expected: diff removes custom publish/GitHub release code, keeps only changelog aggregation helpers, and updates scripts to official changesets commands.

- [ ] **Step 5: Commit**

Run:

```bash
git add package.json packages/changeset-config scripts/changesets .github/workflows/release.yml apps/document/packages/changeset-config docs/superpowers/plans/2026-06-29-rewrite-changeset-config.md
git commit -m "refactor: delegate release flow to changesets"
```

Expected: commit succeeds.

---

## Self-Review

- Spec coverage: The plan maximizes changesets reuse by delegating versioning, publishing, GitHub releases, and prerelease mode to official changesets CLI/action. It keeps only `unconfig`-specific changelog aggregation and documentation sync.
- Placeholder scan: No task uses unresolved placeholders. Each code-changing task includes concrete file content or exact JSON/YAML snippets.
- Type consistency: Public API names are consistent across tasks: `readChangesetsReleasePlan`, `generateProjectChangelog`, and `writeProjectChangelog`.
