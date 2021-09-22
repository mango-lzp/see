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
    })
  })

  
  clearButton.addEventListener('click', () => {
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
  })

  readAllButton.addEventListener('click', () => {
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

      const hideBox = document.querySelector('.hide-article-box')
      if(hideBox){
        hideBox.style.display = 'none'
      }
    })
  })
}
