import process from 'node:process'
import { changesetsGenerateReleases } from '@unconfig/changeset-config'

const cwd = process.cwd()

changesetsGenerateReleases({
  cwd,
})
