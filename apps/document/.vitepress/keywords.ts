import { readFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const excludeFileNames = ['.DS_Store', 'README.md', 'meta']

function filterGuard(name: string) {
  return !excludeFileNames.includes(name)
}

export async function getPackageKeywords() {
  const pkgs = (
    await readdir(resolve(`${__dirname}`, '../../../packages'))
  ).filter(filterGuard)

  let keywords: string[] = []
  for (const pkgName of pkgs) {
    const pkgInfo = await readFile(
      resolve(`${__dirname}`, `../../../packages/${pkgName}/package.json`),
      'utf-8',
    )
    const pkgInfoJson = JSON.parse(pkgInfo) as Record<string, any>
    keywords = [...keywords, ...pkgInfoJson.keywords.reverse()]
  }

  return [...new Set(keywords)]
}
