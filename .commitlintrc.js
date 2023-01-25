const fs = require('node:fs')
const path = require('node:path')

const apps = fs.readdirSync(path.resolve(__dirname, './apps'))
const packages = fs.readdirSync(path.resolve(__dirname, './packages'))
const scopes = [...apps, ...packages]

module.exports = {
  extends: ['@unconfig/commitlint-config/base.js'],
  rules: {
    'scope-enum': [2, 'always', scopes],
  },
  prompt: {
    scopes: [...scopes],
  },
}
