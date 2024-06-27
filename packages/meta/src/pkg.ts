import { name } from '../package.json'

const pkgNameSplitResult = name.split('/')

export const PKG_PREFIX = pkgNameSplitResult[0]
export const PKG_GROUP_NAME = PKG_PREFIX.slice(1)
export const PKG_NAME = pkgNameSplitResult[1]
