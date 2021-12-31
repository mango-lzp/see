chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ clearBoolean: false }, function() {
    console.log('The clearBoolean is false.');
  });
});

window.onload = async () => {
  const clearButton = document.getElementById('clear')
  const readAllButton = document.getElementById('read-all')
  
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const doFnInPage = fn => chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: fn,
  })

  // remove extra text
  doFnInPage(() => {
    document.addEventListener('copy', (event) => {
      event.clipboardData.setData('text', document.getSelection())
      event.preventDefault()
      event.stopImmediatePropagation()
    }, true)
  })

  let storageValue = await chrome.storage.sync.get(['clearBoolean'])
  const  { clearBoolean } = storageValue || {}
  console.log(storageValue)
  if(clearBoolean) {
    clearImg = 'checkmark-circle-fill.svg'
    clearFnInPage()
  } else {
    clearImg = 'minus-circle.svg'
  }

  const clearFnInPage = () => {
    doFnInPage(() => {
      // 百度文库等添加ctrl+c监听事件阻止复制
      window.addEventListener('keydown', function(event) {
        event.stopImmediatePropagation()
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
    })
  }
  
  clearButton.addEventListener('click', () => {
    if(clearBoolean) return

    // 设置状态
    chrome.storage.sync.set({ clearBoolean: false })

    // 更换icon
    const clearImg = document.querySelector('#clear .svg-wrap img')
    clearImg.src = 'checkmark-circle-fill.svg'

    clearFnInPage()
  })

  readAllButton.addEventListener('click', () => {
    // 更换icon
    const clearImg = document.querySelector('#read-all .svg-wrap img')
    clearImg.src = 'checkmark-circle-fill.svg'

    doFnInPage(() => {
      // 展示隐藏部分
      const content = document.querySelector('.article_content')
      if(content){
        content.style.height = 'unset'
      }
      // 移除底部讨厌的关注后阅读
      const hideBox = document.querySelector('.hide-article-box')
      if(hideBox){
        hideBox.style.display = 'none'
      }
    })
  })
}
