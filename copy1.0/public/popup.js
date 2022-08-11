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
    new Promise(resolve => {
      if(keyMap[id]) {
        resolve(options[keyMap[id]])
      } else {
        getChromeStorageSync('extends').then(extendsObj => resolve(extendsObj[id].enable))
      }
    }).then(enable => {
      const clearImg = $(`#${id} .svg-wrap img`)
      clearImg.src = enable ? TrueImage : FalseImage
    })
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

  $$('#item-container .block')
    .forEach(node => {
      if(Object.keys(keyMap).includes(node.id)) return
      
      node.addEventListener('click', () => {
        checkIcon(node.id)

        getExtendsStorage.then(obj => setExtendsStorage({ id: node.id, enable: !obj.enable}))
      })
    })

  $('#create').onclick = () => {
    addCustomItem($('#title-text').value, $('#scripts').value)
  }
}
