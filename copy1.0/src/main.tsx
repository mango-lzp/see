import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// if(import.meta.env.DEV) {
  console.log('hrm reload ready', '-----------')
  const ws = new WebSocket('ws://localhost:2333')
    
  ws.onmessage = (event) => {
    console.log('reload trigger', event)
      let msg = JSON.parse(event.data)
      if (msg === 'watch-build-done') {
        chrome.runtime.reload()
      }
  }
// }
