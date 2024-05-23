import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if(import.meta.env.VITE_IS_DEV === 'true') {
  console.log('hrm reload ready', '-----------')
  const ws = new WebSocket('ws://localhost:2333')
    
  ws.onmessage = (event) => {
    let msg = JSON.parse(event.data)
    if (msg === 'reload-app') {
      chrome.runtime.reload()
    }
    if(msg === 'reload-window') {
      window.location.reload()
    }
  }
  chrome.storage.sync.get((data) => {console.log(data)})
}

