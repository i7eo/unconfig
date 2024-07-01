import { hasVue } from '@unconfig/utils'
import {
  comments,
  ignores,
  imports,
  javascript,
  jsonc,
  markdown,
  // markdownlint,
  node,
  prettier,
  sortKeys,
  sortPackageJson,
  sortTsconfig,
  typescript,
  unicorn,
  vue,
  yml,
} from './configs'
import type { FlatESLintConfig } from 'eslint-define-config'

/** Ignore common files and include javascript support */
export const presetJavaScript = [
  ...ignores,
  ...javascript,
  ...comments,
  ...imports,
  ...unicorn,
  ...node,
]
/** Includes basic json(c) file support and sorting json keys */
export const presetJsonc = [...jsonc, ...sortPackageJson, ...sortTsconfig]
/** Includes markdown, yaml + `presetJsonc` support */
export const presetLangsExtensions = [...markdown, ...yml, ...presetJsonc]
/** Includes `presetJavaScript` and typescript support */
export const presetBasic = [...presetJavaScript, ...typescript, ...sortKeys]
/**
 * Includes
 * - `presetBasic` (JS+TS) support
 * - `presetLangsExtensions` (markdown, yaml, jsonc) support
 * - Vue support
 * - Prettier support
 */
export const presetAll = [
  ...presetBasic,
  ...presetLangsExtensions,
  ...vue,
  ...prettier,
]
export { presetBasic as basic, presetAll as all }
export type Config = FlatESLintConfig
/**
 *
 * @param config
 * @param features
 * @returns
 */
export function configBuilder(
  config: Config | Config[] = [],
  {
    markdown: enableMarkdown = true,
    prettier: enablePrettier = true,
    vue: enableVue = hasVue,
  }: Partial<{
    /** Vue support. Auto-enable. */
    vue: boolean
    /** Prettier support. Default: true */
    prettier: boolean
    /** markdown support. Default: true */
    markdown: boolean
    sortKeys: boolean
  }> = {},
): Config[] {
  const configs = [...presetBasic, ...yml, ...presetJsonc]
  if (enableVue) {
    configs.push(...vue)
  }
  if (enableMarkdown) {
    // configs.push(...[...markdown, ...markdownlint])
    configs.push(...markdown)
  }
  if (enablePrettier) {
    configs.push(...prettier)
  }
  if (Object.keys(config).length > 0) {
    configs.push(...(Array.isArray(config) ? config : [config]))
  }
  return configs
}
