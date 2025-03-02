import { ConfigEnv, UserConfig } from "vite"
import WebSocket, { WebSocketServer } from "ws"
import fs from 'fs'
import chokidar from 'chokidar'
import { resolve } from 'path'
import path from 'path'

const PUBLIC_DIR = resolve(__dirname, '../public')
const CONTENT_FILE = resolve(__dirname, '../dist/content-scripts.js')
const SRC_DIR = resolve(__dirname, '../src')

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
  let isFirstBuild = true
  
  console.log('HRM middleware initialized', '-----------')
  
  // 发送通知
  const send = (msg) => {
    console.log('Sending message:', msg)
    if (!wsClient) return
    msg = JSON.stringify(msg)
    wsClient.send(msg)
    console.log('Message sent successfully')
  }

  // 清理资源
  // 如果不清空变量的引用，插件将不会自动退出
  const close = () => {
    console.log('Closing HRM connections')
    wsClient && wsClient.close()
    socketServer && socketServer.close()
    wsClient = null
    socketServer = null
  }
  
  // 处理文件变化
  const handleFileChange = debounce((event, filePath) => {
    console.log(`File ${event}: ${filePath}`)
    
    // 处理 public 目录下的文件变化
    if(filePath.includes('/public/')) {
      const fileName = path.basename(filePath)
      const dest = resolve(__dirname, `../dist/${fileName}`)
      console.log(`Copying file ${filePath} to ${dest}`)
      fs.copyFileSync(filePath, dest)
      
      // 如果是 background.js 或 manifest.json 变化，需要重新加载整个扩展
      if(fileName === 'background.js' || fileName === 'manifest.json') {
        console.log('Critical extension file changed, reloading extension')
        send('reload-app')
        return
      }
    }
    
    // 处理内容脚本变化
    if(filePath === CONTENT_FILE || filePath.includes('/content/')) {
      console.log('Content script changed, reloading extension')
      send('reload-app')
      return
    }
    
    // 处理源代码文件变化
    if(filePath.includes('/src/')) {
      const ext = path.extname(filePath)
      const relativePath = path.relative(SRC_DIR, filePath)
      
      // 发送更详细的更新信息
      send({
        type: 'update-module',
        path: relativePath,
        extension: ext,
        timestamp: Date.now()
      })
      
      // 对于某些特定文件，可能需要完全重新加载
      if(filePath.includes('App.tsx') || filePath.includes('main.tsx')) {
        console.log('Core React component changed, reloading window')
        send('reload-window')
      }
    }
  }, 300)
  
  return {
    name: 'hrm-plugin',
    apply(config: UserConfig, { command }: ConfigEnv) {
      // build 且 watch 的情况下插件生效
      const canUse = command === 'build' && Boolean(config.build?.watch)
      if (canUse) {
        // 创建 websocket server
        socketServer = new WebSocketServer({ port: 2333 })
        
        socketServer.on('connection', (client) => { 
          console.log('Client connected to HRM WebSocket')
          wsClient = client 
          
          client.on('message', (message) => {
            try {
              const data = JSON.parse(message.toString())
              console.log('Received message from client:', data)
              
              // 处理客户端消息
              if(data.type === 'client-ready') {
                console.log('Client reported ready state')
              }
            } catch (e) {
              console.error('Error parsing client message:', e)
            }
          })
          
          client.on('close', () => {
            console.log('Client disconnected')
            if(wsClient === client) {
              wsClient = null
            }
          })
        })
        
        // 监听文件变化
        chokidar
          .watch([PUBLIC_DIR, CONTENT_FILE, SRC_DIR], { 
            ignoreInitial: true,
            ignored: [
              '**/node_modules/**',
              '**/dist/**',
              '**/.git/**'
            ]
          })
          .on('all', handleFileChange)
          
        console.log('File watchers initialized')
      }
      return canUse
    },
    
    // 构建开始
    buildStart() {
      if(!isFirstBuild) {
        console.log('Rebuild started')
      }
    },

    // popup页面发生变动，重新加载window
    closeBundle() {
      if(isFirstBuild) {
        console.log('Initial build completed')
        isFirstBuild = false
      } else {
        console.log('Build completed, reloading window')
        send('reload-window')
      }
    },
    
    // 关闭监听器
    closeWatcher: () => close()
  }
}