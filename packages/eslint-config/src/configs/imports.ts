import { pluginImport } from '../plugins'
import { GLOB_MARKDOWN, GLOB_SRC, GLOB_SRC_EXT } from '../globs'
import type { FlatESLintConfig } from 'eslint-define-config'

export const imports: FlatESLintConfig[] = [
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/first': 'error',
      'import/no-default-export': 'error',
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-named-default': 'error',
      'import/no-self-import': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [{ group: 'internal', pattern: '{{@,~}/,#}**' }],
          pathGroupsExcludedImportTypes: ['type'],
        },
      ],
    },
  },
  {
    files: [
      `**/*config*.${GLOB_SRC_EXT}`,
      `**/{views,pages,routes,middleware,plugins,api}/${GLOB_SRC}`,
      `**/{index,vite,esbuild,rollup,rolldown,webpack,rspack}.ts`,
      '**/*.d.ts',
      `${GLOB_MARKDOWN}/**`,
      '**/.prettierrc*',
    ],
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/no-default-export': 'off',
    },
  },
]
