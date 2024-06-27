import { parserJsonc, pluginJsonc } from '../plugins'
import { GLOB_JSON, GLOB_JSON5, GLOB_JSONC } from '../globs'
import type { FlatESLintConfig, Rules } from 'eslint-define-config'

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
      ...(pluginJsonc.configs['recommended-with-jsonc']
        .rules as unknown as Rules),
      'jsonc/quote-props': 'off',
      'jsonc/quotes': 'off',
    },
  },
]
