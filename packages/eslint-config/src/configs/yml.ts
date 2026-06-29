import { GLOB_YAML } from '../globs'
import { parserYml, pluginYml } from '../plugins'
import type { FlatESLintConfig, Rules } from 'eslint-define-config'

function mergeConfigRules(configs: Array<{ rules?: Rules }>): Rules {
  return Object.assign({}, ...configs.map((config) => config.rules ?? {}))
}

export const yml: FlatESLintConfig[] = [
  {
    files: [GLOB_YAML],
    languageOptions: {
      parser: parserYml,
    },
    plugins: {
      yml: pluginYml,
    },
    rules: {
      ...mergeConfigRules(pluginYml.configs.standard),
      ...mergeConfigRules(pluginYml.configs.prettier),
      'yml/no-empty-mapping-value': 'off',
    },
  },
]
