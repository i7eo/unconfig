import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { writeProjectChangelog } from '../src/changelog-write'

describe('writeProjectChangelog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-29T08:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inserts project changelog and mirrors website changelog without the marker', () => {
    const cwd = join(tmpdir(), `unconfig-changelog-${Date.now()}`)

    mkdirSync(join(cwd, 'apps/document/content'), { recursive: true })
    writeFileSync(
      join(cwd, 'CHANGELOG.md'),
      '# Changelog\n\n<!-- CHANGELOG:INSERT -->\n',
    )

    const didWrite = writeProjectChangelog({
      cwd,
      content: '**@unconfig/example** `v1.0.0`\n\n- Added release docs',
      projectChangelogPath: 'CHANGELOG.md',
      websiteChangelogPath: 'apps/document/content/changelog.md',
    })

    expect(didWrite).toBe(true)
    expect(readFileSync(join(cwd, 'CHANGELOG.md'), 'utf8')).toBe(
      [
        '# Changelog',
        '',
        '<!-- CHANGELOG:INSERT -->',
        '',
        '## 2026-06-29',
        '',
        '**@unconfig/example** `v1.0.0`',
        '',
        '- Added release docs',
        '',
      ].join('\n'),
    )
    expect(
      readFileSync(join(cwd, 'apps/document/content/changelog.md'), 'utf8'),
    ).toBe(
      [
        '# Changelog',
        '',
        '## 2026-06-29',
        '',
        '**@unconfig/example** `v1.0.0`',
        '',
        '- Added release docs',
        '',
      ].join('\n'),
    )
  })

  it('prepends new content to an existing changelog section for the current day', () => {
    const cwd = join(tmpdir(), `unconfig-changelog-same-day-${Date.now()}`)

    mkdirSync(join(cwd, 'apps/document/content'), { recursive: true })
    writeFileSync(
      join(cwd, 'CHANGELOG.md'),
      [
        '# Changelog',
        '',
        '<!-- CHANGELOG:INSERT -->',
        '',
        '## 2026-06-29',
        '',
        '**@unconfig/example** `v0.9.0`',
        '',
        '- Existing release docs',
        '',
        '## 2026-06-28',
        '',
        '**@unconfig/example** `v0.8.0`',
        '',
        '- Previous release docs',
        '',
      ].join('\n'),
    )

    const didWrite = writeProjectChangelog({
      cwd,
      content: '**@unconfig/example** `v1.0.0`\n\n- Added release docs',
      projectChangelogPath: 'CHANGELOG.md',
      websiteChangelogPath: 'apps/document/content/changelog.md',
    })

    expect(didWrite).toBe(true)
    expect(readFileSync(join(cwd, 'CHANGELOG.md'), 'utf8')).toBe(
      [
        '# Changelog',
        '',
        '<!-- CHANGELOG:INSERT -->',
        '',
        '## 2026-06-29',
        '',
        '**@unconfig/example** `v1.0.0`',
        '',
        '- Added release docs',
        '',
        '**@unconfig/example** `v0.9.0`',
        '',
        '- Existing release docs',
        '',
        '## 2026-06-28',
        '',
        '**@unconfig/example** `v0.8.0`',
        '',
        '- Previous release docs',
        '',
      ].join('\n'),
    )
    expect(
      readFileSync(join(cwd, 'apps/document/content/changelog.md'), 'utf8'),
    ).toBe(
      [
        '# Changelog',
        '',
        '## 2026-06-29',
        '',
        '**@unconfig/example** `v1.0.0`',
        '',
        '- Added release docs',
        '',
        '**@unconfig/example** `v0.9.0`',
        '',
        '- Existing release docs',
        '',
        '## 2026-06-28',
        '',
        '**@unconfig/example** `v0.8.0`',
        '',
        '- Previous release docs',
        '',
      ].join('\n'),
    )
  })

  it('skips writing when generated content is empty', () => {
    const cwd = join(tmpdir(), `unconfig-changelog-empty-${Date.now()}`)

    mkdirSync(cwd, { recursive: true })
    writeFileSync(join(cwd, 'CHANGELOG.md'), '# Changelog\n')

    expect(
      writeProjectChangelog({
        cwd,
        content: '',
        projectChangelogPath: 'CHANGELOG.md',
        websiteChangelogPath: 'apps/document/content/changelog.md',
      }),
    ).toBe(false)
  })

  it('throws when changelog paths are not provided', () => {
    const cwd = join(tmpdir(), `unconfig-changelog-missing-path-${Date.now()}`)

    mkdirSync(cwd, { recursive: true })

    expect(() =>
      writeProjectChangelog({
        cwd,
        content: '**@unconfig/example** `v1.0.0`\n\n- Added release docs',
      }),
    ).toThrow('projectChangelogPath and websiteChangelogPath are required.')
  })
})
