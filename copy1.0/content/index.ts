const options = {
  default: {} as any,
  extends: {} as any
}


//   // 功能三：显示全文
//   if(options.csdnReadAll) {
//     showHide()
//   }
// }

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
  console.log('remove disabled')
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

window.onload = async () => {
  const proxy = new Proxy(options, {
    set(target, propKey, value, receiver) {
      if(propKey === 'default' && value['clear-disabled'].enable) {
        clearDisable()
      }
      return Reflect.set(target, propKey, value, receiver)
    }
  })

  //数据初始化
  await Promise.all(
    Object.keys(options)
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
    if(options.default['clear-text']) {
      event.clipboardData!.setData('text', document.getSelection() as any)
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      console.log('clear text format')
    }
  }, true)

  // 功能二： 解除复制禁用
  // 百度文库等添加ctrl+c监听事件阻止复制
  window.addEventListener('keydown', function(event) {
    if(options.default['clear-disabled']) {
      event.stopImmediatePropagation()
    }
  }, true)
  // 飞书等添加 copy 监听事件阻止复制
  window.addEventListener('copy', function(event) {
    // copy事件已经在clearTextFormat里面处理了，当clearTextFormat为false才需要做处理。
    if(options.default['clear-disabled'] && !options.default['clear-text']) {
      console.log('enable copy')
      event.stopImmediatePropagation()
      event.stopPropagation()
    }
  }, true)

  // @ts-ignore next-line
  chrome.runtime.sendMessage("runEnableScripts")
}