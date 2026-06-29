import { parserJsonc, pluginJsonc } from '../plugins'
import { GLOB_JSON, GLOB_JSON5, GLOB_JSONC } from '../globs'
import type { FlatESLintConfig, Rules } from 'eslint-define-config'

function mergeConfigRules(configs: Array<{ rules?: Rules }>): Rules {
  return Object.assign({}, ...configs.map((config) => config.rules ?? {}))
}

export const jsonc: FlatESLintConfig[] = [
  {
    files: [GLOB_JSON, GLOB_JSON5, GLOB_JSONC],
    languageOptions: {
      parser: parserJsonc,
    },
    plugins: {
      jsonc: pluginJsonc,
    },
    rules: {
      ...mergeConfigRules(pluginJsonc.configs['recommended-with-jsonc']),
      'jsonc/quote-props': 'off',
      'jsonc/quotes': 'off',
    },
  },
]
