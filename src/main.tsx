import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { createHMRManager, logStorageData } from './utils/hmr'

// 保存根元素引用，用于热更新时重新渲染
let root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// 渲染应用函数
function renderApp() {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// 初始渲染
renderApp()

// 开发模式下启用热更新
if(import.meta.env.VITE_IS_DEV === 'true') {
  console.log('HMR client initialized', '-----------')
  
  // 创建并启动热更新管理器
  const hmrManager = createHMRManager(root, renderApp)
  hmrManager.connect()
  
  // 记录存储数据
  logStorageData()
}

