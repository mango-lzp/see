const options = {}

// 页面状态数据保存
class StateController {
  data = {}

  set (id, obj) {
    if(!this.data[id]) this.data[id] = {}

    this.data[id] = Object.assign(this.data[id], obj)
  }

  get (id, type?: string) {
    return type ? this.data?.[id]?.[type] : this.data?.[id]
  }

  notify (type = 'error_log') {
    // @ts-ignore next-line
    chrome.runtime.sendMessage({ type, state: state.data })
  }
}
const state = new StateController()

function clearDisable () {
  // 移除百度文库的广告
  if(window.location.href.includes('baidu')){
    document.querySelectorAll('.hx-warp').forEach((ad: any) => ad.style.display = 'none')
    document.querySelectorAll('.hx-recom-wrapper').forEach((ad: any) => ad.style.display = 'none')
  }
  
  // 移除code、pre userSelect为none
  const setUserSelect = (node) => window.getComputedStyle(node).userSelect === 'none' && (node.style.userSelect = 'auto')
  document.querySelectorAll('code').forEach(setUserSelect)
  document.querySelectorAll('pre').forEach(setUserSelect)
  document.querySelectorAll('code div[data-title="登录后复制"]').forEach((node: any) => node.style.display = 'none')
}

// function showHide () {
//   if(!window.location.hostname?.includes('csdn')) return
//   const content = document.querySelector('.article_content')
//   if(content){
//     content.style.height = 'unset'
//   }
//   // 移除底部讨厌的关注后阅读
//   const hideBox = document.querySelector('.hide-article-box')
//   if(hideBox){
//     hideBox.style.display = 'none'
//   }
// }

let isReady = false
const onReady = async () => {
  if(isReady) return
  isReady = true
  
  const proxy = new Proxy(options, {
    set(target, propKey, value, receiver) {
      if(propKey === 'clear-disabled' && value?.enable) {
        clearDisable()
      }
      return Reflect.set(target, propKey, value, receiver)
    }
  })

  //数据初始化
  await Promise.all(
    ['clear-disabled', 'clear-text']
    .map(key => new Promise(r => {
        // @ts-ignore next-line
        chrome.storage.sync.get(key, data => {
          proxy[key] = data[key]
          r(null)
        })
      })
    )
  )

  // 同步更新options数据
  // @ts-ignore next-line
  chrome.storage.onChanged.addListener(function (changes) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes) as any) {
      proxy[key] = newValue
    }
  })

  // 功能一： remove extra text
  document.addEventListener('copy', (event) => {
    if(options['clear-text']?.enable) {
      event.clipboardData!.setData('text', document.getSelection() as any)
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }
  }, true)

  // 功能二： 解除复制禁用
  // 百度文库等添加ctrl+c监听事件阻止复制
  window.addEventListener('keydown', function(event) {
    if(options['clear-disabled']?.enable) {
      event.stopImmediatePropagation()
    }
  }, true)
  // 飞书等添加 copy 监听事件阻止复制
  window.addEventListener('copy', function(event) {
    // copy事件已经在clearTextFormat里面处理了，当clearTextFormat为false才需要做处理。
    if(options['clear-disabled']?.enable && !options['clear-text']?.enable) {
      event.stopImmediatePropagation()
      event.stopPropagation()
    }
  }, true)


  /*
 * We can manage page DOM from this function, but cannot share variables directly
 * 
 * 'eval' call or injecting script tag with inline source in this context cause CSP error,
 *  but we can load script from web_accessible_resources and execute script string there 
 * 
 * document.dispatchEvent with custom event is used for transferring the payload to the page script
 */
  const inject = () => {
    return new Promise(resolve => {
      const script = document.createElement("script")
      script.setAttribute('type', 'text/javascript')
      // @ts-ignore next-line
      script.setAttribute('src', chrome.runtime.getURL("page-script.js"))
      script.onload = () => {
        /*
          * Using document.dispatchEvent instead window.postMessage by security reason
          * https://github.com/w3c/webextensions/issues/78#issuecomment-915272953
          */
        // document.dispatchEvent(new CustomEvent('message', { detail: scripts }))
        document.head.removeChild(script)
        resolve(null)
      }
    
      document.head.appendChild(script)
    })
  }

  inject().then(() => {
    // @ts-ignore next-line
    chrome.runtime.sendMessage("runEnableScripts")
  })

  // 收集报错信息，作为页面和插件的通信工具。
  window.addEventListener('message', event => {
    const data = event.data
    if(data.type === 'extension_error') {
      // 报错展示策略，只展示当前页面的错误。
      state.set(data.id, { log: data.log })
      state.notify()
    }
  })

  // @ts-ignore next-line
  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      if (request?.type === "getPageData") {
        sendResponse(state.get(request?.id))
      }
      if (request?.type === "clearLog") {
        state.set(request?.id, { log: undefined })
        state.notify()
      }
    }
  );
}

const ready = () => {
  document.removeEventListener( "DOMContentLoaded", ready )
	window.removeEventListener( "load", ready )
  onReady()
}
// Catch cases where onReady() is called
// after the browser event has already occurred.
if(document.readyState !== 'loading') {
  window.setTimeout(onReady)
} else {
  // Use the handy event callback
  document.addEventListener('DOMContentLoaded', ready)
  // A fallback to window.onload, that will always work
  window.addEventListener('load', ready)
}