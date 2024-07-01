import type { Config as PrettierConfig } from 'prettier'

export type Config = PrettierConfig

const presetBasic: Config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
}

const presetAll: Config = {
  ...presetBasic,
  overrides: [
    {
      files: [
        '**/node_modules/**',
        '**/dist/**',
        '**/output/**',
        '**/coverage/**',
        '**/temp/**',
        '**/.vitepress/cache/**',
        '**/.nuxt/**',
        '**/.vercel/**',
        '**/.changeset/**',
        '**/.idea/**',
        '**/.output/**',
        '**/.vite-inspect/**',

        '**/CHANGELOG*.md',
        '**/*.min.*',
        '**/LICENSE*',
        '**/__snapshots__',
        '**/auto-import?(s).d.ts',
        '**/components.d.ts',
        '**/typed-router.d.ts',
        '**/pnpm-lock.yaml',
      ],
      options: {
        requirePragma: true,
      },
    },
    {
      files: ['**/jsr.json'],
      options: {
        parser: 'json-stringify',
      },
    },
  ],
}

export { presetBasic as basic, presetAll as all }
/**
 *
 * @param config
 * @returns
 */
export function configBuilder(config: Config = {}): Config {
  let configs = {
    ...presetAll,
  }

  if (Object.keys(config).length > 0) {
    configs = {
      ...configs,
      ...config,
    }
  }
  return configs
}
