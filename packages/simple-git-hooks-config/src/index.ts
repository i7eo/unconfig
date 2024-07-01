interface GitHooks {
  'pre-commit': string
  'prepare-commit-msg': string
  'commit-msg': string
  'post-commit': string
  'post-checkout': string
  'pre-rebase': string
}

export type Config = GitHooks

const presetBasic: Partial<Config> = {
  'pre-commit': 'pnpm exec lint-staged --concurrent false',
  'commit-msg': 'pnpm exec commitlint --edit $1',
}

const presetAll: Partial<Config> = {
  ...presetBasic,
}

export { presetBasic as basic, presetAll as all }

/**
 *
 * @param config
 * @returns
 */
export function configBuilder(config: Partial<Config> = {}): Partial<Config> {
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
