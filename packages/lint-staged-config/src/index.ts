import { hasVue } from '@unconfig/utils'
import type { Config as LintStadgeConfig } from 'lint-staged'

const eslintCommand = 'eslint --fix'
const prettierCommand = 'eslint --fix'
const stylelintCommand = 'stylelint --fix --allow-empty-input'

export type Config = LintStadgeConfig

function presetJSX(prettier = true): Config {
  return {
    '*.{js,jsx}': prettier ? [eslintCommand, prettierCommand] : [eslintCommand],
  }
}

function presetTSX(prettier = true): Config {
  return {
    '*.{ts,tsx}': prettier ? [eslintCommand, prettierCommand] : [eslintCommand],
  }
}

function presetVue(prettier = true, stylelint = true): Config {
  return {
    '*.{vue}': prettier
      ? stylelint
        ? [eslintCommand, prettierCommand, stylelintCommand]
        : [eslintCommand, prettierCommand]
      : stylelint
        ? [eslintCommand, stylelintCommand]
        : [eslintCommand],
  }
}

function presetStyle(prettier = true): Config {
  return {
    '*.{scss,less,styl,html}': prettier
      ? [stylelintCommand, prettierCommand]
      : [stylelintCommand],
  }
}

const presetMarkdown: Config = {
  '*.md': ['prettier --write'],
}
const presetJSON: Config = {
  '*.json': ['prettier --write'],
}

const presetBasic: Config = {
  ...presetJSX(),
  ...presetTSX(),
}

const presetAll: Config = {
  ...presetBasic,
  // '!(cesium/assets/js/**).{js,jsx,ts,tsx}': [
  //   'eslint --fix',
  //   'prettier --write',
  // ],
  ...presetVue(),
  ...presetStyle(),
  ...presetMarkdown,
  ...presetJSON,
}

export { presetBasic as basic, presetAll as all }

/**
 *
 * @param config
 * @param features
 * @returns
 */
export function configBuilder(
  config: Config = {},
  {
    markdown: enableMarkdown = true,
    prettier: enablePrettier = true,
    vue: enableVue = hasVue,
    stylelint: enableStylelint = true,
    json: enableJson = true,
  }: Partial<{
    /** Vue support. Auto-enable. */
    vue: boolean
    /** Prettier support. Default: true */
    prettier: boolean
    /** markdown support. Default: true */
    markdown: boolean
    /** stylelint support. Default: true */
    stylelint: boolean
    /** json support. Default: true */
    json: boolean
  }> = {},
): Config {
  let configs = {
    ...presetBasic,
  }

  if (enableVue) {
    configs = {
      ...configs,
      ...presetVue(enablePrettier, enableStylelint),
    }
  }

  if (enableStylelint) {
    configs = {
      ...configs,
      ...presetStyle(enablePrettier),
    }
  }

  if (enableMarkdown) {
    configs = {
      ...configs,
      ...presetMarkdown,
    }
  }

  if (enableMarkdown) {
    configs = {
      ...configs,
      ...presetMarkdown,
    }
  }

  if (enableJson) {
    configs = {
      ...configs,
      ...presetJSON,
    }
  }

  if (Object.keys(config).length > 0) {
    configs = {
      ...configs,
      ...config,
    }
  }
  return configs
}
