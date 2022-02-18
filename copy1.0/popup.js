import { ClearDisabledId, ClearTextId, ReadAllId, TrueImage, FalseImage } from './enum.js'

const options = {}
const keyMap = {
  [ClearTextId]: 'clearTextFormat',
  [ClearDisabledId]: 'clearDisabled',
  [ReadAllId]: 'csdnReadAll',
}

window.onload = async () => {
  // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  // const doFnInPage = fn => chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   function: fn,
  // })

  await Initialize(options, Object.values(keyMap))
  console.log(options)

  const checkIcon = (id) => {
    // 更换icon
    const state = options[keyMap[id]]
    const clearImg = document.querySelector(`#${id} .svg-wrap img`)
    clearImg.src = state ? TrueImage : FalseImage
  }

  ;[ClearTextId, ClearDisabledId, ReadAllId].forEach(id => {
    checkIcon(id)
    const button = document.getElementById(id)
    button.addEventListener('click', () => {
      const key = keyMap[id]
      const value = options[key]
  
      // 设置状态
      options[key] = !value
      chrome.storage.sync.set({ [key]: !value })
      // 更换icon
      checkIcon(id)
    })
  })
}
