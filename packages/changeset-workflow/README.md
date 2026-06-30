# @unconfig/changeset-workflow

<p><strong>English</strong> | <a href="./README.zh-CN.md">中文</a></p>

`@unconfig/changeset-workflow` is a project-specific helper package built on
top of Changesets. It does not replace the Changesets CLI. Instead, it reads the
official release plan and adds the `unconfig`-specific project changelog sync
used by the repository and documentation site.

## Design

- `release-plan`: reads packages, config, pre-state, and changesets through
  official `@changesets/*` APIs.
- `changelog-generate`: converts a release plan into project-level markdown.
- `changelog-write`: inserts generated markdown into `CHANGELOG.md` and mirrors
  it to the documentation changelog.
- `markdown`: normalizes changeset summaries and generated markdown with
  deterministic spacing rules.

The package intentionally leaves versioning, publishing, tags, GitHub releases,
and prerelease state to Changesets.

## Defaults

- Empty release plans generate an empty string.
- Empty changelog content is skipped and returns `false`.
- `apps` or other packages can be excluded with `ignorePackages`.
- Package entries can be ordered with the `packages` option.
- `projectChangelogPath` and `websiteChangelogPath` are required.
- The project changelog file must contain `<!-- CHANGELOG:INSERT -->`.

## Basic Usage

```ts
import {
  generateProjectChangelog,
  writeProjectChangelog,
} from '@unconfig/changeset-workflow'

const content = await generateProjectChangelog({
  cwd: process.cwd(),
  packages: ['@unconfig/eslint-config', '@unconfig/prettier-config'],
  ignorePackages: ['@unconfig/document'],
})

await writeProjectChangelog({
  cwd: process.cwd(),
  content,
  projectChangelogPath: 'CHANGELOG.md',
  websiteChangelogPath: 'apps/document/content/changelog.md',
})
```

## Entrypoints

The package exposes a single root entrypoint.

| Entrypoint                     | Use for                                            |
| ------------------------------ | -------------------------------------------------- |
| `@unconfig/changeset-workflow` | release plan reading, changelog generation/writing |

## Release Plan Reading

Use `readChangesetsReleasePlan(cwd)` when you need the raw Changesets release
plan.

```ts
import { readChangesetsReleasePlan } from '@unconfig/changeset-workflow'

const releasePlan = await readChangesetsReleasePlan(process.cwd())
```

This function delegates to `@changesets/assemble-release-plan`,
`@changesets/config`, `@changesets/pre`, `@changesets/read`, and
`@manypkg/get-packages`.

## Changelog Generation

`generateProjectChangelog()` reads the current workspace release plan and
returns markdown that is ready to write without a separate formatter pass.

```ts
const content = await generateProjectChangelog({
  cwd: process.cwd(),
  packages: ['@unconfig/eslint-config'],
  ignorePackages: ['@unconfig/document'],
})
```

For tests or custom workflows, use `generateProjectChangelogFromReleasePlan()`
with a lightweight release-plan object.

## Changelog Writing

`writeProjectChangelog()` inserts content into the current date section when it
already exists, otherwise it creates a new date section after the changelog
marker. The newest content for a day is placed first, and the mirrored
documentation changelog is written without the marker.

```ts
await writeProjectChangelog({
  cwd: process.cwd(),
  content,
  projectChangelogPath: 'CHANGELOG.md',
  websiteChangelogPath: 'apps/document/content/changelog.md',
})
```

## Changesets Workflow

Keep release ownership in the official Changesets CLI.

```bash
pnpm changeset:generate
pnpm changeset:version
pnpm changeset:publish
```

`changeset:version` should run `changeset version` first, then call the
changelog sync script that uses this package.

## Prereleases

Use official Changesets prerelease mode instead of custom publishing logic.

```bash
pnpm changeset:pre:alpha
pnpm changeset:generate
pnpm changeset:version
pnpm changeset:publish
pnpm changeset:pre:exit
```

For temporary builds, use snapshot versions:

```bash
pnpm changeset:snapshot
```
