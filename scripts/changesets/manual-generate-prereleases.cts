import process from 'node:process'
import { manualGeneratePrereleases } from '@unconfig/changeset-config'

const cwd = process.cwd()

manualGeneratePrereleases({
  cwd,
})
