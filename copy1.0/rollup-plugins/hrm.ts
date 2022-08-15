import { ConfigEnv, UserConfig } from "vite"
import WebSocket, { WebSocketServer } from "ws"
import fs from 'fs'
import chokidar from 'chokidar'
import { resolve } from 'path'

const PUBLIC_DIR = resolve(__dirname, './public')
const CONTENT_FILE = resolve(__dirname, './dist/content-scripts.js')

function debounce(fn, timeout = 400) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), timeout)
  }
}

export const HRMMiddleware = () => {
  let wsClient: WebSocket | null
  let socketServer : WebSocketServer | null
  
  console.log('HRM middleware in', '-----------')
  // 发送通知
  const send = (msg) => {
    console.log('before send meg', msg)
    if (!wsClient) return
    msg = JSON.stringify(msg)
    wsClient.send(msg)
    console.log('sended meg', msg)
  }

  // 清理资源
  // 如果不清空变量的引用，插件将不会自动退出
  const close = () => {
    wsClient && wsClient.close()
    wsClient = null
    socketServer = null
  }
  
  return {
    name: 'hrm-plugin',
    apply(config: UserConfig, { command }: ConfigEnv) {
      // build 且 watch 的情况下插件生效
      const canUse = command === 'build' && Boolean(config.build?.watch)
      if (canUse) {
        // 创建 websocket server
        socketServer = new WebSocketServer({ port: 2333 })
        socketServer.on('connection', (client) => { wsClient = client })
        // public 文件发生变动，需要reload插件。
        chokidar
          .watch([PUBLIC_DIR, CONTENT_FILE], { ignoreInitial: true })
          .on('all', debounce((event, path) => {
            console.log(event, path)
            if(path.includes('/public/')) {
              const dest = resolve(__dirname, `./dist/${path.split('/').pop()}`)
              console.log(`copy file ${path} to ${dest}`)
              fs.copyFileSync(path, dest)
            }
            send('reload-app')
          }))
      }
      return canUse
    },
    // buildStart: options => console.log(options),

    // popup页面发生变动，重新加载window即可。
    closeBundle: () => send('reload-window'),
    // watchChange: () => {},
    closeWatcher: () => close()
  }
}