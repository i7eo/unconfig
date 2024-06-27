import process from 'node:process'
import { changesetsChangelogWrite } from '@unconfig/changeset-config'

const cwd = process.cwd()

changesetsChangelogWrite({
  cwd,
})
