import { defineConfig } from 'eslint/config'
import { configBuilder } from './src/index'

const config = configBuilder()

export default defineConfig(config as any)
