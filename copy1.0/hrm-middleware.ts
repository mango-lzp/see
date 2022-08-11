import { ConfigEnv, UserConfig } from "vite"
import WebSocket, { WebSocketServer } from "ws"

export const HRMMiddleware = () => {
  let ws: WebSocket | null
  let socketServer : WebSocketServer | null
  let timer
  
  console.log('HRM middleware in', '-----------')
  // 发送通知
  const send = (msg) => {
    console.log('send meg', msg)
    if (!ws) return
    msg = JSON.stringify(msg)
    ws.send(msg)
  }
    
  // 清理资源
  // 如果不清空变量的引用，插件将不会自动退出
  const close = () => {
    ws && ws.close()
    clearTimeout(timer)
    ws = null
    timer = null
  }
  
  return {
    name: 'build-notifier',
    apply(config: UserConfig, { command }: ConfigEnv) {
      // 我们只在 build 且 watch 的情况下使用插件
      const canUse = command === 'build' && Boolean(config.build?.watch)
      if (canUse) {
        // 创建 websocket server
        socketServer = new WebSocketServer({ port: 2333 })
        socketServer.on('connection', (client) => ws = client)
      }
      return canUse
    },
    closeBundle() {
      timer = setTimeout(() => send('watch-build-done'), 500)
    },
    watchChange() {
      clearTimeout(timer)
    },
    closeWatcher() {
      close()
    }
  }
}