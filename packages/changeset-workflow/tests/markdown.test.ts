import { describe, expect, it } from 'vitest'
import {
  generateProjectChangelogFromReleasePlan,
  normalizeChangesetSummary,
} from '../src/changelog-generate'

describe('normalizeChangesetSummary', () => {
  it('keeps markdown list lines and prefixes plain lines', () => {
    expect(normalizeChangesetSummary('Added config preset\n- Fixed docs')).toBe(
      '- Added config preset\n- Fixed docs',
    )
  })

  it('normalizes heading spacing and blank lines before formatting', () => {
    expect(
      normalizeChangesetSummary(
        [
          '## 0.1.2',
          '### Patch Changes',
          '',
          '',
          '- Updated dependencies:',
          '  - @unconfig/github@0.1.2',
        ].join('\n'),
      ),
    ).toBe(
      [
        '## 0.1.2',
        '### Patch Changes',
        '- Updated dependencies:',
        '  - @unconfig/github@0.1.2',
      ].join('\n'),
    )
  })
})

describe('generateProjectChangelogFromReleasePlan', () => {
  it('emits a single package changelog section for plain changeset summaries', async () => {
    const content = await generateProjectChangelogFromReleasePlan({
      changesets: [
        {
          id: 'one',
          summary: 'Added config preset',
        },
        {
          id: 'two',
          summary: '- Fixed docs',
        },
      ],
      releases: [
        {
          name: '@unconfig/eslint-config',
          newVersion: '1.2.0',
          changesets: ['one', 'two'],
        },
      ],
    })

    expect(content).toBe(
      [
        '**@unconfig/eslint-config** `v1.2.0`',
        '',
        '- Added config preset',
        '- Fixed docs',
        '',
      ].join('\n'),
    )
  })

  it('filters ignored packages and sorts entries by preferred package order', async () => {
    const content = await generateProjectChangelogFromReleasePlan(
      {
        changesets: [
          {
            id: 'one',
            summary: 'Updated eslint rules',
          },
          {
            id: 'two',
            summary: '- Updated docs app',
          },
          {
            id: 'three',
            summary: 'Updated prettier options',
          },
        ],
        releases: [
          {
            name: '@unconfig/prettier-config',
            newVersion: '1.1.0',
            changesets: ['three'],
          },
          {
            name: '@unconfig/document',
            newVersion: '1.1.0',
            changesets: ['two'],
          },
          {
            name: '@unconfig/eslint-config',
            newVersion: '1.2.0',
            changesets: ['one'],
          },
        ],
      },
      {
        packages: ['@unconfig/eslint-config', '@unconfig/prettier-config'],
        ignorePackages: ['@unconfig/document'],
      },
    )

    expect(content).toBe(
      [
        '**@unconfig/eslint-config** `v1.2.0`',
        '',
        '- Updated eslint rules',
        '',
        '**@unconfig/prettier-config** `v1.1.0`',
        '',
        '- Updated prettier options',
        '',
      ].join('\n'),
    )
  })

  it('emits markdownlint-friendly spacing for headings and nested lists', async () => {
    const content = await generateProjectChangelogFromReleasePlan({
      changesets: [
        {
          id: 'one',
          summary: [
            '## 0.1.2',
            '### Patch Changes',
            '',
            '',
            '- Updated dependencies:',
            '  - @unconfig/github@0.1.2',
          ].join('\n'),
        },
      ],
      releases: [
        {
          name: '@unconfig/eslint-config',
          newVersion: '1.2.0',
          changesets: ['one'],
        },
      ],
    })

    expect(content).toBe(
      [
        '**@unconfig/eslint-config** `v1.2.0`',
        '',
        '## 0.1.2',
        '',
        '### Patch Changes',
        '',
        '- Updated dependencies:',
        '  - @unconfig/github@0.1.2',
        '',
      ].join('\n'),
    )
  })

  it('returns empty content when no releases contain publishable changesets', async () => {
    const content = await generateProjectChangelogFromReleasePlan({
      changesets: [
        {
          id: 'one',
          summary: 'Updated eslint rules',
        },
      ],
      releases: [
        {
          name: '@unconfig/eslint-config',
          newVersion: '1.2.0',
          changesets: [],
        },
      ],
    })

    expect(content).toBe('')
  })
})
