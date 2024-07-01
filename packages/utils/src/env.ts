import process from 'node:process'
import { getPackageInfoSync, isPackageExists } from 'local-pkg'

export const isInEditor = !!(
  (process.env.VSCODE_PID ||
    process.env.VSCODE_CWD ||
    process.env.JETBRAINS_IDE ||
    process.env.VIM) &&
  !process.env.CI
)

export const hasTypeScript = isPackageExists('typescript')

export const hasVue =
  isPackageExists('vue') ||
  isPackageExists('nuxt') ||
  isPackageExists('vitepress')

export function getVueVersion(path = process.cwd()) {
  const pkg = getPackageInfoSync('vue', { paths: [path] })
  if (
    pkg &&
    typeof pkg.version === 'string' &&
    !Number.isNaN(+pkg.version[0])
  ) {
    return +pkg.version[0]
  }
  return 3
}
export function isVue3(path = process.cwd()) {
  return getVueVersion(path) === 3
}
