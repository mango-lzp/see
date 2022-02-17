import { ClearDisabledId, ClearTextId, ReadAllId, TrueImage, FalseImage } from './enum.js'

const options = {}
const keyMap = {
  [ClearTextId]: 'clearTextFormat',
  [ClearDisabledId]: 'clearDisabled',
  [ReadAllId]: 'csdnReadAll',
}

const Initialize = async () => {
  await Promise.all(
    Object.values(keyMap).map(async key => {
      return new Promise(resolve => {
        chrome.storage.sync.get(key, (data) => {
          Object.assign(options, { [key]: data[key] })
          resolve()
        })
      })
    })
  )
}

window.onload = async () => {
  const clearTextButton = document.getElementById(ClearTextId)
  const clearDisabledButton = document.getElementById(ClearDisabledId)
  const readAllButton = document.getElementById(ReadAllId)
  
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const doFnInPage = fn => chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: fn,
  })

  await Initialize()
  console.log(options)

  const checkIcon = (id) => {
    // 更换icon
    const state = options[keyMap[id]]
    const clearImg = document.querySelector(`#${id} .svg-wrap img`)
    console.log(state, clearImg)
    clearImg.src = state ? TrueImage : FalseImage
  }

  checkIcon(ClearTextId)
  checkIcon(ClearDisabledId)
  checkIcon(ReadAllId)

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

  clearTextButton.addEventListener('click', () => {
    const key = keyMap[ClearTextId]
    const value = options[key]

    // 设置状态
    options[key] = !value
    chrome.storage.sync.set({ [key]: !value })
    // 更换icon
    checkIcon(ClearTextId)
  })
  
  clearDisabledButton.addEventListener('click', () => {
    const key = keyMap[ClearDisabledId]
    const value = options[key]

    // 设置状态
    options[key] = !value
    chrome.storage.sync.set({ [key]: !value })
    // 更换icon
    checkIcon(ClearDisabledId)

    clearFnInPage()
  })

  readAllButton.addEventListener('click', () => {
    const key = keyMap[ReadAllId]
    const value = options[key]

    options[key] = !value
    chrome.storage.sync.set({ [key]: !value })
    checkIcon(ReadAllId)

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
