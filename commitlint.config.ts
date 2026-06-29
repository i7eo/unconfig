import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { all, configBuilder } from '@unconfig/commitlint-config'

const excludeFileNames = ['.DS_Store', 'README.md']
const dirname = path.dirname(fileURLToPath(import.meta.url))

function createScopes() {
  function filterGuard(name: string) {
    return !excludeFileNames.includes(name)
  }

  const apps = fs.readdirSync(path.resolve(dirname, 'apps')).filter(filterGuard)

  const packages = fs
    .readdirSync(path.resolve(dirname, 'packages'))
    .filter(filterGuard)

  return [
    '.changeset',
    '.vscode',
    ...apps,
    ...packages,
    'scripts',
    'typings',
    'repository-config', // 根目录工程化配置文件
  ]
}

const config = configBuilder({
  ...all,

  prompt: {
    ...all.prompt,
    scopes: [...createScopes()],
  },

  rules: {
    ...all.rules,
    'scope-enum': [2, 'always', createScopes()],
  },
})

export default config
