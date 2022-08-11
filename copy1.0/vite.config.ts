import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { HRMMiddleware } from './hrm-middleware'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, __dirname)
  const isDev = env.VITE_NODE_ENV = 'development'

  const plugins: any[] = [react()]
  if(isDev) plugins.push(HRMMiddleware())

  return defineConfig({
    plugins
  })
}
