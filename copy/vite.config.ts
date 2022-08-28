import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { HRMMiddleware } from './rollup-plugins/hrm'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, __dirname)
  const isDev = env.VITE_IS_DEV === 'true'

  const plugins: any[] = [react()]
  if(isDev) plugins.push(HRMMiddleware())

  return defineConfig({
    build: {
      emptyOutDir: isDev ? false : true
    },
    plugins
  })
}
