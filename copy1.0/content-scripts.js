const options = {}
const keyList = ['clearTextFormat', 'clearDisabled', 'csdnReadAll']

window.onload = async () => {
  await Initialize(options, keyList)

  const proxy = new Proxy({}, {
    set(target, propKey, value, receiver) {
      Reflect.set(target, propKey, value, receiver)
      Reflect.set(options, key, value)
      switch(propKey) {
        case 'clearDisabled': {
          if(value) {
            clearDisable()
          }
          break;
        }
        case 'csdnReadAll': {
          if(value) {
            showHide()
          }
          break;
        }
      }
    }
  })

  // 同步更新options数据
  chrome.storage.onChanged.addListener(function (changes) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      proxy[key] = newValue
    }
  })

  // 功能一： remove extra text
  document.addEventListener('copy', (event) => {
    if(options.clearTextFormat) {
      event.clipboardData.setData('text', document.getSelection())
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      console.log('clear text format')
    }
  }, true)

  // 功能二： 解除复制禁用
  if(options.clearDisabled) {
    clearDisable()
  }

  // 功能三：显示全文
  if(options.csdnReadAll) {
    showHide()
  }
}

function clearDisable () {
  // 百度文库等添加ctrl+c监听事件阻止复制
  window.addEventListener('keydown', function(event) {
    if(options.clearDisabled) {
      event.stopImmediatePropagation()
    }
  }, true)

  // 飞书等添加 copy 监听事件阻止复制
  window.addEventListener('copy', function(event) {
    // copy事件已经在clearTextFormat里面处理了，当clearTextFormat为false才需要做处理。
    if(options.clearDisabled && !options.clearTextFormat) {
      event.stopImmediatePropagation()
      event.stopPropagation()
    }
  }, true)

  // 移除百度文库的广告
  if(window.location.href.includes('baidu')){
    document.querySelectorAll('.hx-warp').forEach(ad => ad.style.display = 'none')
    document.querySelectorAll('.hx-recom-wrapper').forEach(ad => ad.style.display = 'none')
  }
  
  // 移除code、pre userSelect为none
  const setUserSelect = (node) => window.getComputedStyle(node).userSelect === 'none' && (node.style.userSelect = 'auto')
  document.querySelectorAll('code').forEach(setUserSelect)
  document.querySelectorAll('pre').forEach(setUserSelect)
  document.querySelectorAll('code div[data-title="登录后复制"]').forEach(node => node.style.display = 'none')
}

function showHide () {
  if(!window.location.hostname?.includes('csdn')) return
  const content = document.querySelector('.article_content')
  if(content){
    content.style.height = 'unset'
  }
  // 移除底部讨厌的关注后阅读
  const hideBox = document.querySelector('.hide-article-box')
  if(hideBox){
    hideBox.style.display = 'none'
  }
}
