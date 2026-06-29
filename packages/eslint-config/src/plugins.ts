/* eslint-disable import/first */
// @ts-nocheck

import { fixupPluginRules } from '@eslint/compat'

export type InteropDefault<T> = T extends { default: infer U } ? U : T

/* #__NO_SIDE_EFFECTS__ */
function interopDefault<T>(m: T): InteropDefault<T> {
  return (m as any).default || m
}

import * as _pluginComments from 'eslint-plugin-eslint-comments'
export const pluginComments: any = fixupPluginRules(
  interopDefault(_pluginComments),
)

import * as _pluginMarkdown from 'eslint-plugin-markdown'
export const pluginMarkdown: any = interopDefault(_pluginMarkdown)

import * as _pluginMarkdownLint from 'eslint-plugin-markdownlint'
export const pluginMarkdownLint: any = interopDefault(_pluginMarkdownLint)

import tseslint from 'typescript-eslint'
export { tseslint }

import * as _pluginUnicorn from 'eslint-plugin-unicorn'
export const pluginUnicorn: any = interopDefault(_pluginUnicorn)

import * as _pluginVue from 'eslint-plugin-vue'
export const pluginVue: any = interopDefault(_pluginVue)

import * as _pluginNode from 'eslint-plugin-n'
export const pluginNode: any = interopDefault(_pluginNode)

import * as _pluginPerfectionist from 'eslint-plugin-perfectionist'
export const pluginPerfectionist: any = interopDefault(_pluginPerfectionist)

import * as _pluginPrettier from 'eslint-plugin-prettier'
export const pluginPrettier: any = interopDefault(_pluginPrettier)

import * as _configPrettier from 'eslint-config-prettier'
export const configPrettier: any = interopDefault(_configPrettier)

import * as _pluginImport from 'eslint-plugin-import-x'
export const pluginImport: any = interopDefault(_pluginImport)

import * as _pluginJsonc from 'eslint-plugin-jsonc'
export const pluginJsonc: any = interopDefault(_pluginJsonc)

import * as _pluginUnusedImports from 'eslint-plugin-unused-imports'
export const pluginUnusedImports: any = interopDefault(_pluginUnusedImports)

import * as _pluginYml from 'eslint-plugin-yml'
export const pluginYml: any = interopDefault(_pluginYml)

import * as _parserMarkdownLint from 'eslint-plugin-markdownlint/parser.js'
export const parserMarkdownLint: any = interopDefault(_parserMarkdownLint)

import * as _parserVue from 'vue-eslint-parser'
export const parserVue: any = interopDefault(_parserVue)

import * as _parserYml from 'yaml-eslint-parser'
export const parserYml: any = interopDefault(_parserYml)

import * as _parserJsonc from 'jsonc-eslint-parser'
export const parserJsonc: any = interopDefault(_parserJsonc)
