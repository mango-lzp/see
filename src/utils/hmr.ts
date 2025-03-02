// 热更新工具文件
import React from 'react'
import { Root } from 'react-dom/client'

// 热更新管理器类型
type HMRManager = {
  connect: () => void;
  disconnect: () => void;
}

// 存储模块缓存，用于热更新
const moduleCache = new Map();
let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let renderCallback: (() => void) | null = null;

// 创建热更新管理器
export function createHMRManager(rootElement: Root, render: () => void): HMRManager {
  renderCallback = render;
  
  function connectWebSocket() {
    // 清除之前的重连计时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    // 创建新连接
    ws = new WebSocket('ws://localhost:2333');
    
    ws.onopen = () => {
      console.log('HMR WebSocket connected');
      // 通知服务器客户端已准备好
      ws?.send(JSON.stringify({ type: 'client-ready' }));
    }
    
    ws.onclose = () => {
      console.log('HMR WebSocket disconnected, trying to reconnect...');
      ws = null;
      
      // 尝试重新连接
      reconnectTimer = window.setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
    
    ws.onerror = (error) => {
      console.error('HMR WebSocket error:', error);
    }
      
    ws.onmessage = (event) => {
      try {
        let msg = JSON.parse(event.data);
        console.log('Received HMR message:', msg);
        
        if (msg === 'reload-app') {
          console.log('Reloading extension...');
          chrome.runtime.reload();
        }
        
        if(msg === 'reload-window') {
          console.log('Reloading window...');
          window.location.reload();
        }
        
        // 处理模块更新
        if(typeof msg === 'object' && msg.type === 'update-module') {
          handleModuleUpdate(msg);
        }
      } catch (error) {
        console.error('Error processing HMR message:', error);
      }
    }
  }
  
  // 处理模块更新
  function handleModuleUpdate(msg: any) {
    console.log(`Module updated: ${msg.path}`);
    
    // 对于CSS文件，可以尝试直接替换样式而不刷新页面
    if(msg.extension === '.css') {
      updateCSSModule(msg);
    } 
    // 对于JSX/TSX文件，尝试进行React组件热更新
    else if(msg.extension === '.jsx' || msg.extension === '.tsx') {
      updateReactModule(msg);
    } else {
      // 对于其他文件，刷新窗口
      window.location.reload();
    }
  }
  
  // 更新CSS模块
  function updateCSSModule(msg: any) {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if(href && href.includes(msg.path)) {
        // 添加时间戳强制浏览器重新加载CSS
        const newHref = href.split('?')[0] + `?t=${msg.timestamp}`;
        link.setAttribute('href', newHref);
        console.log(`Hot-replaced CSS: ${href} -> ${newHref}`);
      }
    });
  }
  
  // 更新React模块
  function updateReactModule(msg: any) {
    console.log('React component changed, attempting hot update...');
    
    // 记录更新的模块路径
    moduleCache.set(msg.path, msg.timestamp);
    
    try {
      // 对于React组件的更新，我们尝试重新渲染根组件
      if (renderCallback) {
        renderCallback();
        console.log('React component hot-updated successfully');
        
        // 发送成功消息回服务器
        ws?.send(JSON.stringify({
          type: 'hmr-success',
          path: msg.path,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Failed to hot-update React component:', error);
      // 如果热更新失败，回退到完全刷新
      window.location.reload();
    }
  }
  
  // 断开连接
  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }
  
  return {
    connect: connectWebSocket,
    disconnect
  };
}

// 开发调试信息
export function logStorageData() {
  chrome.storage.sync.get((data) => {
    console.log('Current storage data:', data);
  });
}